export function promiseToWaitUntil(tfFunc) {
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

export function randomInts(amount, start, end) {
    var outarray = [];
    for (var i=0; i<=amount; i++) {
        outarray.push( start + Math.floor(Math.random() * (end-start)) );
    }
    return outarray;
}

export function randomChars(amount, chararray) {
    var outarray = [];
    for (var i=0; i<=amount; i++) {
        outarray.push( chararray[Math.floor(Math.random() * chararray.length)] );
    }
    return outarray;
}

export function numArrayToString(array) {
    var outstr = "";
    for (var n in array) {
        outstr += chr(array[n]);
    }
    return outstr;
}

export function asc(l) {
    return l.charCodeAt(0);
}

export function chr(n) {
    return String.fromCharCode(n);
}
