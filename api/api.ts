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
                "Error trying to connect to SQL. trying again in 1s.\n",
                error
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
                status: [
                    "The server is still trying to connect to MySQL!",
                    "By the time you read and understand this text, the issue has probably been resolved.",
                    "Try again."
                ]
            });
            return;
        }

        if (req.files === undefined || req.files.video === undefined) {
            res.status(400).json({
                error: true,
                status: [
                        "The video file was not sent to us.",
                        "Try refreshing the webpage and trying again.",
                        "If the issue persists, contact an administrator."
                ]
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
                    video.processVid(vidfn, videoID);
                });
                sql.query(
                    'INSERT INTO videos SET ?', {
                        video_id: videoID,
                        views: 0,
                        likes: 0,
                        dislikes: 0,
                        formats: 'PROCESSING',
                        title: '',
                        description: ''
                    },
                    (error, results, fields) => {
                        if (error) throw error;
                    }
                );
                res.status(201).json({
                    error: false,
                    id: videoID,
                    status: [
                        201,
                        "Your video is currently being processed.",
                        `The following ID has been reserved: ${videoID}`
                    ]
                });
            } else {
                // Video invalid
                fs.unlinkSync(vidfn);
                res.status(415).json({
                    error: true,
                    status: [
                        415,
                        "The video file you uploaded could not be read.",
                        vv[1]
                    ]
                });
            }
        });

    });

    app.get('/api/video/:id', (req, res) => {

        if (!allowConnections) {
            res.status(503).json({
                error: true,
                status: [
                    503,
                    "The API is still trying to establish a connection with MySQL and cannot yet process this request.",
                    "Please wait and try again."
                ]
            });
            return;
        }

        sql.query(
            'SELECT * FROM videos WHERE video_id=?', [req.params.id],
            (error, results, fields) => {
                if (error) { res.status(500).json({
                    error: true,
                    status: [
                        500,
                        "The attempt to communicate with MySQL failed.",
                        `${error}`
                    ]
                }); } else {
                    if (results[0]!==undefined) res.json({
                        error: false,
                        status: [200],
                        info: results[0]
                    });
                    else res.status(404).json({
                        error: true,
                        status: [
                            404,
                            `No such video '${req.params.id}' was found.`,
                            "The video you're looking for may have been removed, or the uploader's account could have been removed."
                        ]
                    });
                };
            }
        );
        
    });

    app.get('/api/video/:id/:format.:ext', (req, res) => {

        if (!allowConnections) {
            res.status(503).end("Still trying to connect to MySQL");
            return;
        }

        var vidfn = `/dynamic/videos/${req.params.id},f${req.params.format}.${req.params.ext}`;

        if (fs.existsSync(vidfn)) {
            res.download(vidfn);
        } else {
            res.status(404).end("No such video file");
        }
        return;
        
    });

}