const express = require('express');
const { exec } = require("child_process");

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

function numArrayToString(array) {
    outstr = "";
    for (var n in array) {
        outstr += String.fromCharCode(n);
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
        (funcQueue[funcID])();
        delete funcQueue[funcID];
    }

    queueRunning = false;
}

async function queue(f, willBeAwaited=false) {

    var tid = genQueuedTaskID();
    funcQueue[tid] = f;

    if (willBeAwaited)
        return promiseToWaitUntil(() => {
            return !(tid in funcQueue);
        });

}

setInterval(processQueue, 50);

/* **== FFMPEG-POWERED VIDEO CONVERTER ==** */

// TODO


/* **== SERVER ==** */

app.get('/', (req, res) => {
    res.redirect('/static/home');
});

app.post('/api/video', (req, res) => {
    res.end("<i>brap moment</i>");
});

app.get('/api/video', (req, res) => {

});

app.use( '/static', express.static('/static') )

app.listen(port, () => {
    console.log(`Server running at :${port}.`);
});