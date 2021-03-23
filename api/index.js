const express = require('express');
const child_process = require("child_process");
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();
const port = 80;

/* **== GENERAL USEFUL SNIPPETS ==** */

function promiseToWaitUntil(tfFunc) {
    return new Promise( resolve => {

        function check() {
            if (tfFunc())
                resolve();
            else
                setTimeout(check, 50);
        }
        check();

    });
}

function randomInts(amount, start, end) {
    outarray = [];
    for (i=0; i<=amount; i++) {
        outarray.push( start + Math.floor(Math.random() * (end-start)) );
    }
    return outarray;
}

function randomChars(amount, chararray) {
    outarray = [];
    for (i=0; i<=amount; i++) {
        outarray.push( chararray[Math.floor(Math.random() * chararray.length)] );
    }
    return outarray;
}

function numArrayToString(array) {
    outstr = "";
    for (var n in array) {
        outstr += chr(array[n]);
    }
    return outstr;
}

function asc(l) {
    return l.charCodeAt(0);
}

function chr(n) {
    return String.fromCharCode(n);
}

/* **== LINEAR FUNCTION QUEUER ==** */

var funcQueue = {};
var queueRunning = false;

function genQueuedTaskID() {

    tid = numArrayToString( randomInts(5, asc(' '), asc('~')) );

    if (tid in funcQueue)
        return genQueuedTaskID();
    else
        return tid;

}

function processQueue() {
    if (queueRunning) return;

    queueRunning = true;

    for (var funcID in funcQueue) {
        console.log("Processing task",funcID);
        (funcQueue[funcID])();
        delete funcQueue[funcID];
    }

    queueRunning = false;
}

async function queue(f, willBeAwaited=false) {

    var tid = genQueuedTaskID();
    funcQueue[tid] = f;

    console.log("New task",tid);

    if (willBeAwaited)
        return promiseToWaitUntil(() => {
            return !(tid in funcQueue);
        });

}

setInterval(processQueue, 50);

/* **== FFMPEG-POWERED VIDEO CONVERTER ==** */

function videoExists() {
    return false;
}

function genVideoID() {

    vid = randomChars(11,
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    ).join('');
    console.log("Generated Video ID:",vid);

    if (videoExists(vid))
        return genVideoID();
    else
        return vid;

}

async function checkVideoValid(fn) {
    return new Promise( resolve => {
        child_process.exec(
            `ffprobe -loglevel warning -show_streams "${fn}"`,
            (e,so,se) => {
                if (e) resolve([false, se]);
                resolve([so.includes("video") && !so.includes("level=-99"), "Only audio and/or a picture were detected."]);
            }
        )
    });
}

function processVid(fn, vid) {

    console.log("Processing video",vid);

    // Get extension of file
    fnext = fn.split('.');
    fnext = fnext[fnext.length-1];

    nfn = `/dynamic/temp/${vid},of.${fnext}`;
    fs.renameSync(fn, nfn);
    fn = nfn;

    console.log("Starting processing of",vid,"; FORMAT 0 - H264");
    child_process.exec(
        `ffmpeg -hide_banner -loglevel warning -i "${fn}" -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v h264 -crf 25 -c:a aac -pix_fmt yuv420p "/dynamic/temp/${vid},f0.mp4"`,
        (e,so,se) => {
            if (e) {
                console.log("(FORMAT 0 - H264) Video",vid,"failed to process!");
                console.log(e,so,se);
                console.log("Files may be left over in /dynamic/{videos,temp}!");
                return;
            }
            console.log("(FORMAT 0 - H264) Successfully processed",vid);
            console.log(so,se);
            fs.renameSync(`/dynamic/temp/${vid},f0.mp4`, `/dynamic/videos/${vid},f0.mp4`);
            fs.unlinkSync(fn);
        }
    );

    //// this just sigsegvs on my system :/
    // console.log("Starting processing of",vid,"; FORMAT 1 - AV1");
    // child_process.exec(
    //      `ffmpeg -hide_banner -loglevel warning -i "${fn}" -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -strict -2 -c:v libaom-av1 -crf 25 -b:v 0 -strict -2 -c:a opus "/dynamic/temp/${vid},f1.webm"`,
    //      (e,so,se) => {
    //         if (e) {
    //             console.log("(FORMAT 1 - AV1) Video",vid,"failed to process!");
    //             console.log(e,so,se);
    //             console.log("Files may be left over in /dynamic/{videos,temp}!");
    //             return;
    //         }
    //         console.log("(FORMAT 1 - AV1) Successfully processed",vid);
    //         console.log(so,se);
    //         fs.renameSync(`/dynamic/temp/${vid},f1.webm`, `/dynamic/videos/${vid},f1.webm`);
    //         fs.unlinkSync(fn);
    //     }
    // );
    
}

/* **== SERVER ==** */

app.use( '/static', express.static('/static') )
app.use(fileUpload({
    createParentPath: true
}));

app.get('/', (req, res) => {
    res.redirect('/static/home');
});

app.post('/api/video', (req, res) => {

    vid = req.files.video;
    vidfn = '/dynamic/temp_uploads/' + vid.name;
    vid.mv(vidfn);

    queue(async () => {
        vv = await checkVideoValid(vidfn);
        if (vv[0]) {
            // Video valid
            videoID = genVideoID();
            queue(() => {
                processVid(vidfn, videoID);
            });
            res.end("Your video is currently being processed.<br>"+
                    `The following URL has been reserved: ${videoID}`);
        } else {
            // Video invalid
            fs.unlinkSync(vidfn);
            res.end("<red>The video file you uploaded could not be read!</red><br>"+
                    `<pre>${vv[1]}</pre>`);
        }
    });

});

app.get('/api/video', (req, res) => {

});

app.listen(port, () => {
    console.log(`Server running at :${port}.`);
});