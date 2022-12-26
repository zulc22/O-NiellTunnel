export function promiseToWaitUntil(tfFunc): Promise<void> {
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

export function randomInts(amount: number, start: number, end: number): number[] {
    var outarray = [];
    for (var i=0; i<=amount; i++) {
        outarray.push( start + Math.floor(Math.random() * (end-start)) );
    }
    return outarray;
}

export function randomChars(amount: number, chararray: string | string[]): string[] {
    var outarray = [];
    for (var i=0; i<=amount; i++) {
        outarray.push( chararray[Math.floor(Math.random() * chararray.length)] );
    }
    return outarray;
}

export function numArrayToString(array: number[]): string {
    var outstr = "";
    for (var n in array) {
        outstr += chr(array[n]);
    }
    return outstr;
}

export function asc(l: string): number {
    return l.charCodeAt(0);
}

export function chr(n: number): string {
    return String.fromCharCode(n);
}

export function arrayNegIndex(a: any[], ni: number) {
    return a[a.length+ni];
}