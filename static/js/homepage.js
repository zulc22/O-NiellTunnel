$('.progressbar').hide();

var uploadform = $("#uform");
var progressbar = $(".progressbar")[0];
var bar = $(".bar")[0];
var status = $('#status');
var postto = "/api/video";

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
                    bar.html(percentComplete + '%');
                }
                status.html('uploading...');
            }, false);
            return xhr;
        },
        // if you can't understand this part you shouldn't be reading this
        type: 'POST',
        url: postto,
        // afaik this only works for POST. don't care enough to check.
        data: new FormData(this[0]), // this=uploadform
        // no idea why this shit is 'false'.
        contentType: false,
        cache: false,
        processData: false,
        // right before data starts to be sent
        beforeSend: () => {
            uploadform.hide();
            progressbar.show();
            bar.width('0%');
            status.html('hold on');
        },
        // when the form gets a non-200 code probably
        error: () => {
            status.html('it didnt work');
        },
        // when the form succeeds. resp is a string of what the server sent back 
        success: (resp) => {
            this[0].reset();
            status.html(`it worked<br>response: ${resp}`);
        }
    });
});
