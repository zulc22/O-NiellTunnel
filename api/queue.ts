import * as util from './util';

var funcQueue = {};
var queueRunning = false;

function genQueuedTaskID(): string {

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

function processQueue(): void {
    if (queueRunning) return;

    queueRunning = true;

    for (var funcID in funcQueue) {
        console.log("Processing task",funcID);
        (funcQueue[funcID])();
        delete funcQueue[funcID];
    }

    queueRunning = false;
}

export default function queue(f, willBeAwaited=false): void | Promise<void> {

    var tid = genQueuedTaskID();
    funcQueue[tid] = f;

    console.log("New task",tid);

    if (willBeAwaited)
        return util.promiseToWaitUntil(() => {
            return !(tid in funcQueue);
        });

}

setInterval(processQueue, 50);