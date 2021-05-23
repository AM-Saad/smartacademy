/*jslint browser: true*/

/*global console, alert, $, jQuery*/

(function () {
    const videos = {
        fileUploaded: 0,
        lessonId: document.querySelector('input[name="lessonId"]').value,
        init: function () {
            this.cashDom()
            this.bindEvents()
        },
        Refresh: function () {
            location.reload(true);
        },
        cashDom: function () {
            this.$videoFrom = $('.toggle-session-form')
            // this.bar = document.getElementsByClassName("progress-bar")[0];
            // this.lessonId = document.querySelector('input[name="lessonId"]').value;
        },
        bindEvents: function () {
            this.$videoFrom.on('click', function () {
                if (videos.fileUploaded > 0) {
                    videos.Refresh()

                } else {
                    $('#sessionForm').toggleClass('none')
                }
            })
            $('#UploadsessionButton').on('click', this.submitSession.bind(this))
        },
     
        submitSession: async function (info) {
            $('#UploadBox').addClass('loader-effect')
            const title = document.getElementById('sessionTitle').value;
            const url = document.getElementById('sessionUrl').value;
            const data = await fetchdata(`/teacher/sessions/${videos.lessonId}`, 'post', JSON.stringify({ link: url, title: title }), true)
            if (data != null) {
                $('#UploadBox').removeClass('loader-effect')
                location.reload(true);
            }

        }

    }


    videos.init()
})()
