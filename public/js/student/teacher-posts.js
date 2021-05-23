/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
    const events = {
        allposts: [],
        teacherId: $('#teacherId').val(),
        teacherCenters: [],
        eventName: null,
        eventclassroom: null,
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
        },
        cashDom: function () {
            this.$postsBox = $('#allposts')
            // this.$teacherId = $('#teacherId').val()
        },
        bindEvents: function () {
            // this.$eventType.on('change', this.getType.bind(this))
            $('body').on('click', '.showComments', this.getComments.bind(this))
            // $('body').on('click', '.event-sub-menu_btn', this.openEventSubMenu.bind(this))
            // $('body').on('click', '.event-sub-menu_delete', this.deleteEvent.bind(this))

            $('body').on('click', '.submit-comment', this.addNewComment.bind(this))

            $('body').on('click', '#closeComments', events.closeCommentBox.bind(this))
        },
        getEvents: async function (e) {
            const data = await fetchdata(`/teachers/posts/${this.teacherId}`, 'get', {}, true)

            if (data != null) {
                $('#posts-holder').fadeOut(500)
                this.allposts = data.json.posts
                this.renderEvents(this.allposts)
            }

            // events.socket.on('event', (data) => {
            //     this.allposts.unshift(data)
            //     this.renderEvents(this.allposts)
            // });
        },

        getComments: async function (e) {
            e.preventDefault()
            $('.comments').empty()
            $('#allcomments').removeClass('none').animate({ height: '400px', opacity: 1 }, 200)
            $('#allcomments').addClass('loader-effect')
            const postId = $(e.target).parents('.post').find('input[name=postId]').val()
            const data = await fetchdata(`/public/comments/${postId}`, 'get', {}, true)
            if (data != null) {
                displaycomments(data.json.comments, postId)
            }
            $('#allcomments').removeClass('loader-effect')

        },
        addNewComment: async function (e) {
            $('.addNewComment').removeClass('submit-comment')
            $('#allcomments').addClass('loader-effect')
            const itemId = $('input[name="itemId"]').val()
            const teacherId = $('input[name="teacherId"]').val()

            const comment = $(e.target).parent(".addComment").find('input[name=comment]').val()
            const data = await fetchdata(`/public/comments/${itemId}?person=${teacherId}&&itemname=event`, 'post', JSON.stringify({ comment }), true)
            if (data != null) {
                const c = data.json.comment
                events.updatecomments(c)
                $('#newCommentInput').val(' ')
                $(".comments").animate({ scrollTop: $('.comments').prop("scrollHeight") }, 1000);
                const item = this.allposts.find(p => p._id.toString() == itemId.toString())
                const totalcomments = item.comments + 1
                
                $(`input[value="${itemId}"]`).parents('.post').find('.showComments').html(`Comments: ${totalcomments}`)
            }
            $('#allcomments').removeClass('loader-effect')
            $('.addNewComment').addClass('submit-comment')
        },
        updatecomments: function (c) {
            $('#allcomments .fall-back').remove()
            $('#allcomments .comments').append(`
            <div class="comment" >
                <img src="/${c.image}">
                <a href="/public/profile/${c.by._id}">${c.by.name}</a>
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
               return this.$postsBox.append(`
               <img src="/images/postHolder.png" class="eventHolder" style="width:50%; opacity:.5; margin:auto; display:block">
                <h3 style="
                text-align: center;
                color: #666;
                font-weight: 900;
                ">لا يوجد اخبار جديده<h3>
                `)
            }
            displayposts(events, this.$postsBox)

            $('#allposts img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden', height: '30px' })
                }
            })
        },
    }
    events.init()
})()
