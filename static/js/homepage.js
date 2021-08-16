$(()=>{ // defer

var uploadform = $("#uform");
var progressbar = $(".progressbar");
var bar = $(".bar");
var status = $('#status');
var postto = "/api/video/new";

progressbar.hide();

function msgBox() {
    // TODO
}

// when you press submit
$("#uform").on('submit', (e) => {

    // i have to both of these for it to not redirect (i want it to redirect if JS is off)
    e.stopImmediatePropagation();
    e.preventDefault();
    
    // good luck understanding this shit. it's mostly copy pasted.
    $.ajax({
        xhr: () => {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    var percentComplete = Math.floor((evt.loaded / evt.total) * 100);
                    bar.width(percentComplete + '%');
                    bar.text(percentComplete + '%');
                }
            }, false);
            return xhr;
        },
        // if you can't understand this part you shouldn't be reading this
        type: 'POST',
        url: postto,
        // afaik this only works for POST. don't care enough to check.
        data: new FormData(uploadform[0]),
        // no idea why this shit is 'false'.
        contentType: false,
        cache: false,
        processData: false,
        // right before data starts to be sent
        beforeSend: () => {
            uploadform.hide();
            progressbar.show();
            bar.width('0%');
            status.text('uploading...');
        },
        // when the form gets a non-200 code. resp is what the server sent back 
        error: (xhr, st, resp) => {
            status.html(`it didnt work<br>response: ${JSON.stringify(resp)}`);
        },
        // when the form succeeds. resp is what the server sent back 
        success: (resp) => {
            uploadform[0].reset();
            status.html(`it worked<br>response: ${JSON.stringify(resp)}`);
        }
    });
});

}); // defer