/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
    const events = {
        allEvents: [],
        teacherCenters: [],
        eventName: null,
        eventGrade: null,
        eventCenter: null,
        eventType: null,
        eventFile: null,
        eventImage: null,
        fetchedComments: [],
        socket: null,
        init: function () {
            this.initSocket()
            this.cashDom()
            this.bindEvents()
            this.getEvents()

        },
        initSocket: function () {
            events.socket = io.connect('http://localhost:3000')
        },
        cashDom: function () {
            this.$allEventsBox = $('#allEvents')
            // this.$teacherId = $('#teacherId').val()
        },
        bindEvents: function () {
            // this.$eventType.on('change', this.getType.bind(this))
            $('body').on('click', '.showComments', this.getComments.bind(this))
            // $('body').on('click', '.event-sub-menu_btn', this.openEventSubMenu.bind(this))
            // $('body').on('click', '.event-sub-menu_delete', this.deleteEvent.bind(this))

            $('body').on('click', '.addNewComment', events.addNewComment)

            $('body').on('click', '#closeComments', events.closeCommentBox.bind(this))
        },
        getEvents: async function (e) {
            const data = await fetchdata('/teacher-events', 'get', {}, true)
            if (data != null) {
                $('#holders').fadeOut(500)
                this.allEvents = data.json.events
                this.renderEvents(this.allEvents)
            }

            // events.socket.on('event', (data) => {
            //     this.allEvents.unshift(data)
            //     this.renderEvents(this.allEvents)
            // });
        },

        getComments: async function (e) {
            $('.comments').empty()
            $('#allcomments').toggleClass('none', 'loader-effect').animate({ height: '400px', opacity: 1 }, 200)
            e.preventDefault()
            const eventId = $(e.target).parents('.event').find('input[name=eventId]').val()
            const data = await fetchdata(`/public/comments/${eventId}`, 'get', {}, true)
            if (data != null) {
                displaycomments(data.json.comments, eventId)
            }
        },
        addNewComment: async function (e) {
            const itemId = $('input[name="itemId"]').val()
            const teacherId = $('input[name="teacherId"]').val()
            console.log(teacherId);

            const comment = $(e.target).parent(".addComment").find('input[name=comment]').val()
            const data = await fetchdata(`/public/comments/${itemId}?person=${teacherId}&&itemname=event`, 'post', JSON.stringify({ comment }), true)
            if (data != null) {
                const c = data.json.comment
                events.updatecomments(c)
                $('#newCommentInput').val(' ')
                $(".comments").animate({ scrollTop: $('.comments').prop("scrollHeight") }, 1000);
            }

        },
        updatecomments: function (c) {
            $('#allcomments .fall-back').remove()
            $('#allcomments .comments').append(`
            <div class="comment" >
                <img src="/${c.image}">
                <a href="/public/profile/${c.by}">${c.name}</a>
                <p>${c.comment}</p>
            </div>
        `)
        },
        closeCommentBox: function (e) {
            $('#allcomments').animate({ height: '0', opacity: 0 }, 300, function () {
                $(this).addClass('none')
                $('.comments').empty()
            })
            this.fetchedComments = []
        },
        openEventSubMenu: function (e) {
            e.stopPropagation()
            $('.event-sub-menu').not($(e.target).parents('.event').find('.event-sub-menu')).removeClass('activeMenu')
            $(e.target).parents('.event').find('.event-sub-menu').toggleClass('activeMenu')
        },
        renderEvents: function (events) {
            if (events.length === 0) {
                    this.$allEventsBox.append(`
                <h3 style="
                text-align: center;
                color: #666;
                font-weight: 900;
                ">No Result To Display Yet..<h3>
                <img src="images/eventHolder.png" class="eventHolder" style="width:50%; opacity:.5; margin:auto; display:block">
                `)
            }
            displayevents(events, this.$allEventsBox)

            $('#allEvents img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden', height: '30px' })
                }
            })
        },
    }
    events.init()
})()
