import * as util from './util.mjs';

var funcQueue = {};
var queueRunning = false;

function genQueuedTaskID() {

    // REFACTORREFACTOR:
    // use util.randomChars() instead of util.numArrayToString(util.randomInts)
    // for simplicity

    //var tid = util.numArrayToString( util.randomInts(5, util.asc(' '), util.asc('~')) );
    var tid = util.randomChars(3,
"!\"#$%&'()*+,-./0123456789:;<=>?@"+
"ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`"+
"abcdefghijklmnopqrstuvwxyz{|}~"
    ).join('');

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

export default async function queue(f, willBeAwaited=false) {

    var tid = genQueuedTaskID();
    funcQueue[tid] = f;

    console.log("New task",tid);

    if (willBeAwaited)
        return util.promiseToWaitUntil(() => {
            return !(tid in funcQueue);
        });

}

setInterval(processQueue, 50);