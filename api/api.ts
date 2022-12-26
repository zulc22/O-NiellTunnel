import mysql from 'mysql';
import queue from './queue';
import * as fs from 'fs';
import * as video from './video';

var sql;
var allowConnections = false;

function trySqlConnect(): void {
    sql = mysql.createConnection({
        host     : 'sql',
        user     : 'root',
        password : 'root',
        database : 'onielltunnel'
    });
    sql.connect(error => {
        if (error) {
            console.log(
                `Error trying to connect to SQL. trying again in 1s.\n${error}`
            );
            setTimeout(trySqlConnect, 1*1000);
        } else {
            allowConnections = true;
            console.log("Connected to SQL!");
        }
    });
}
trySqlConnect();

export default function (app): void {

    app.post('/api/video/new', (req, res) => {

        if (!allowConnections) {
            res.status(503).json({
                error: true,
                status:
                    "The API is still trying to establish a connection with MySQL and cannot yet process this request.\n"+
                    "By the time you've read this message the problem should have fixed itself.\n"+
                    "If the issue persists, contact an administrator."
            });
            return;
        }

        if (req.files === undefined || req.files.video === undefined) {
            res.status(400).json({
                error: true,
                status:
                        "No video file was not sent to us.\n"+
                        "Try refreshing the webpage and trying again.\n"+
                        "If the issue persists, contact an administrator."
            });
            return;
        }

        var vid = req.files.video;
        var vidfn = '/dynamic/temp_uploads/' + vid.name;
        
        queue(async () => {
            await vid.mv(vidfn);
            var vv = await video.checkVideoValid(vidfn);
            if (vv[0]) {
                // Video valid
                var videoID = video.genVideoID();
                queue(() => {
                    video.processVid(vidfn, videoID, completed_format => {
                        sql.query(
                            "UPDATE videos SET formats=if(formats = '', ?, concat(formats, ?)) WHERE id=?",
                            [
                                completed_format,
                                ","+completed_format,
                                videoID
                            ],
                            (error, results, fields) => {
                                if (error) throw error;
                            }
                        )
                    });
                });
                sql.query(
                    'INSERT INTO videos SET ?', {
                        id: videoID,
                        likes: 0,
                        dislikes: 0,
                        formats: '',
                        title: 'Sample Title',
                        description: 'Sample Desc'
                    },
                    (error, results, fields) => {
                        if (error) throw error;
                    }
                );
                res.status(201).json({
                    error: false,
                    id: videoID,
                    status:
                        "Your video is currently being processed.\n"+
                        `The following ID has been reserved: ${videoID}`
                });
            } else {
                // Video invalid
                fs.unlinkSync(vidfn);
                res.status(415).json({
                    error: true,
                    status:
                        "The video file you uploaded could not be read.\n"+
                        vv[1]
                });
            }
        });

    });

    app.get('/api/video/:id', (req, res) => {

        if (!allowConnections) {
            res.status(503).json({
                error: true,
                status: 
                    "The API is still trying to establish a connection with MySQL and cannot yet process this request.\n"+
                    "Please wait and try again."
            });
            return;
        }

        sql.query(
            'SELECT * FROM videos WHERE id=?', [req.params.id],
            (error, results, fields) => {
                if (error) { res.status(500).json({
                    error: true,
                    status:
                        "The attempt to communicate with MySQL failed.\n"+
                        `${error}`
                }); } else {
                    if (results[0]!==undefined) res.json({
                        error: false,
                        status: results[0]
                    });
                    else res.status(404).json({
                        error: true,
                        status: 
                            `No such video '${req.params.id}' was found.\n`+
                            "The video you're looking for, or the uploader's account could have been removed."
                    });
                };
            }
        );
        
    });

    app.get('/api/video/:id/:format.:ext', (req, res) => {

        if (!allowConnections) {
            res.status(503).end("The API is still trying to establish a connection with MySQL and cannot yet process this request.");
            return;
        }

        var vidfn = `/dynamic/videos/${req.params.id},f${req.params.format}.${req.params.ext}`;

        if (fs.existsSync(vidfn)) {
            res.download(vidfn);
        } else {
            res.status(404).end("No such video file.");
        }
        return;
        
    });

}