import * as child_process from 'child_process';
import * as fs from 'fs';
import * as util from './util';

export function videoExists(vid: string): boolean {
    return false;
}

export function genVideoID(): string {

    var vid = util.randomChars(5,
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    ).join('');
    console.log("Generated Video ID:",vid);

    if (videoExists(vid))
        return genVideoID();
    else
        return vid;

}

export function checkVideoValid(fn: string): Promise<any[]> {
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

export async function processVid(fn, vid): Promise<boolean | string> {

    console.log("Processing video",vid);

    // Get extension of file
    var fnext = fn.split('.');
    fnext = fnext[fnext.length-1];

    var nfn = `/dynamic/temp/${vid},of.${fnext}`;
    fs.renameSync(fn, nfn);
    fn = nfn;

    console.log("Starting processing of",vid,"; FORMAT 0 - H264");
    return await new Promise( resolve => child_process.exec(
        `ffmpeg -hide_banner -loglevel warning -i "${fn}" -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" -c:v h264 -crf 25 -c:a aac -pix_fmt yuv420p "/dynamic/temp/${vid},f0.mp4"`,
        (e,so,se) => {
            if (e) {
                console.log("(FORMAT 0 - H264) Video",vid,"failed to process!");
                console.log(e,so,se);
                console.log("Files may be left over in /dynamic/{videos,temp}!");
                resolve(false);
                return;
            }
            
            console.log("(FORMAT 0 - H264) Successfully processed",vid);
            console.log(so,se);
            
            fs.renameSync(`/dynamic/temp/${vid},f0.mp4`, `/dynamic/videos/${vid},f0.mp4`);
            fs.unlinkSync(fn);
            
            resolve(`/dynamic/videos/${vid},f0.mp4`);
        }
    ));
    
}
