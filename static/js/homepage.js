console.log("hello")

$('.progressbar').hide();

$("#uform").on('submit', (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
    $.ajax({
        xhr: () => {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", (evt) => {
                if (evt.lengthComputable) {
                    var percentComplete = Math.floor((evt.loaded / evt.total) * 100);
                    $(".bar").width(percentComplete + '%');
                    $(".bar").html(percentComplete + '%');
                }
                $('#status').html('uploading...');
            }, false);
            return xhr;
        },
        type: 'POST',
        url: '/api/video',
        data: new FormData($('#uform')[0]),
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: () => {
            $('#uform').hide();
            $('.progressbar').show();
            console.log('beforesend');
            $(".bar").width('0%');
            $('#status').html('hold on');
        },
        error: () => {
            console.log('err')
            $('#status').html('it didnt fucking work');
        },
        success: (resp) => {
            console.log('succ')
            $('#uform')[0].reset();
            $('#status').html(`it fuckin g worked<br>response: ${resp}`);
        }
    });
});
