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
    
    $.ajax({
        // progress bar code
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
        // important params
        type: 'POST',
        url: postto,
        data: new FormData(uploadform[0]),
        //
        contentType: false,
        cache: false,
        processData: false,
        // right before data starts to be sent
        beforeSend: () => {
            uploadform.hide();
            progressbar.show();
            bar.width('0%');
            status.text('Uploading...');
        },
        // when the form gets a non-200 code. resp is what the server sent back 
        error: (xhr, st, resp) => {
            status.text(resp.status);
        },
        // when the form succeeds. resp is what the server sent back 
        success: (resp) => {
            uploadform[0].reset();
            location.href = `/api/video/${resp.id}`;
        }
    });
});

}); // defer