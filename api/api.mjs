import mysql from 'mysql';
import queue from './queue.mjs';
import * as fs from 'fs';
import * as video from './video.mjs';

const sql = mysql.createConnection({
    host     : 'sql',
    user     : 'root',
    password : 'root',
    database : 'onielltunnel'
});
sql.connect();

export default function (app) {

    app.post('/api/video/new', (req, res) => {

        if (req.files === undefined || req.files.video === undefined) {
            res.status(400).end(
                "<red>The video file was not sent to us.</red><br>"+
                "Try refreshing the webpage and trying again.<br>"+
                "If the issue persists, contact an administrator."
            );
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
                res.status(201).end(
                        "Your video is currently being processed.<br>"+
                        `The following URL has been reserved: ${videoID}`
                );
            } else {
                // Video invalid
                fs.unlinkSync(vidfn);
                res.status(415).end(
                        "<red>The video file you uploaded could not be read!</red><br>"+
                        `<pre>${vv[1]}</pre>`
                );
            }
        });

    });

    app.get('/api/video/:id', (req, res) => {

        sql.query(
            'SELECT * FROM videos WHERE video_id=?', [id],
            (error, results, fields) => {
                if (error) throw error;
                res.json(fields);
            }
        );
        res.end();
        
    });

    app.get('/api/video/:id/:format.:ext', (req, res) => {

        var vidfn = `/dynamic/videos/${req.params.id},f${req.params.format}.${req.params.ext}`;

        if (fs.existsSync(vidfn)) {
            res.download(vidfn);
        } else {
            res.status(404).end("Video not found.");
        }
        return;
        
    });

}