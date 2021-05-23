$('.watch-vid').on('click', startVideo)
$('.close-vid').on('click', closeVideo)

function startVideo(e) {
    $('.frame').removeClass('none')
    $('.inside-frame').addClass('video-loading')
    setTimeout(() => {
        $('.inside-frame').removeClass('video-loading')

    }, 3000);
    
    $('iframe').attr('src', e.target.dataset.vp)
    $('#navbar-main').addClass('none')

    setTimeout(() => {
        console.log($('.ytp-youtube-button.yt-uix-sessionlink'))

    }, 5000);
}

function closeVideo(e) {
    $('iframe').attr('src', "")
    $('.frame').addClass('none')
    $('#navbar-main').removeClass('none')
}

