/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
    const posts = {
        allposts: [],
        teacherCenters: [],
        postcontent: '',
        postlink: '',
        postGrade: '',
        postCenter: '',
        postType: 'public',
        postFile: null,
        postImage: null,
        fetchedComments: [],
        init: function () {
            this.cashDom()
            this.bindEvents()
            this.getposts()
        },
        cashDom: function () {
            this.$allpostsBox = $('#allposts')
            this.$openNewpostBtn = $('.posts_new-post-btn')
            this.$closeNewpostBtn = $('.posts_new-post-btn_close')
            this.$addpost = $('#addpost')
            this.$postImage = $('.postImage')
            this.$postType = $('.postTypeBtn')
            this.$postGrade = $('.gradeBtn')
            this.$postCenter = $('.centerBtn')

        },
        bindEvents: function () {
            this.$postType.on('change', this.getType.bind(this))
            this.$postImage.on('change', this.getImgFile.bind(this))
            this.$openNewpostBtn.on('click', this.openNewpostBox.bind(this))
            this.$closeNewpostBtn.on('click', this.closeNewpostBox.bind(this))
            this.$postGrade.on('click', this.getpostGrade.bind(this))
            this.$postCenter.on('click', this.getpostCenter.bind(this))
            $('.post-content').on('change', this.getpostcontent.bind(this))
            $('.post-link').on('change', this.getpostlink.bind(this))
            $('.postImage').on('change', this.getImgFile.bind(this))
            $('.submitpost').on('click', this.addpost.bind(this))

            $('body').on('click', '.post-sub-menu_btn', this.openpostSubMenu.bind(this))
            $('body').on('click', '.post-sub-menu_delete', this.deletePost.bind(this))

            $('body').on('click', '.showComments', this.getComments.bind(this))
            $('body').on('click', '.submit-comment', posts.addNewComment.bind(this))

            $('body').on('click', '#closeComments', posts.closeCommentBox.bind(this))

        },

        openNewpostBox: function () {
            $('.posts_new-post-box').css({ display: 'block' }).animate({ opacity: 1 }, 300)
        },
        closeNewpostBox: function () {
            $('.posts_new-post-box').animate({ opacity: 0 }, 300).css({ display: 'none' })
            posts.clearData()
        },
        getImgFile: function (e) {
            let photo = e.target.files[0];  // file from input
            this.postImage = photo
            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                const tumbnialImage = $(e.target).siblings('.thum-img')

                reader.onload = function (e) {
                    tumbnialImage.attr('src', e.target.result);
                }
                reader.readAsDataURL(e.target.files[0]);
                tumbnialImage.removeClass('none')
            }
        },
        getposts: async function (e) {
            const data = await fetchdata('/teacher/posts', 'get', {}, true)
            if (data != null) {
                $('#posts-holder').fadeOut(500)
                this.allposts = data.json.posts
                this.renderposts(data.json.posts)
            }
        },
        getType: async function (e) {
            posts.clearData()

            $(e.target).parents('.posts_new-post-box-selector').find('input[type="radio"]').removeAttr('checked')
            e.target.setAttribute('checked', true)
            const type = $(e.target).val()
            posts.postType = type

            $('.posts-type_btn').css({ color: '#000', background: '#fff' })
            $(e.target).parent().css({
                color: '#444',
                background: '#65de72'
            })
            if (type === 'private') {
                $('.post-options').removeClass('none')
            } else {
                $('.post-options').addClass('none')
            }

        },
        getpostcontent: function (e) {
            this.postcontent = $(e.target).val()
        },
        getpostlink: function (e) {
            this.postlink = $(e.target).val()
        },

        getpostGrade: function (e) {
            $('.filter-grade-item').find('input[type="radio"]').not($(e.target)).prop("checked", false)
            e.target.setAttribute('checked', true)
            $('.gradeBtn').removeAttr('checked')
            this.postGrade = e.target.value
        },
        getpostCenter: function (e) {

            $('.filter-center-item').find('input[type="radio"]').not($(e.target)).prop("checked", false)
            e.target.setAttribute('checked', true)
            $('.centerBtn').removeAttr('checked')
            this.postCenter = e.target.value
        },
        validatepostData: function () {
            if (this.postcontent === '' || this.postcontent === null) {
                message('Content Must Added', 'warning', '.posts_new-post-box')
                return false
            }
            if (this.postType === 'private') {
                if (this.postGrade === '' || this.postCenter === '') {
                    message('Group & Grade Must Added', 'warning', '.posts_new-post-box')
                    return false
                }
            }
            return true
        },
        addpost: async function (e) {
            e.preventDefault()
            const valid = this.validatepostData()
            let formData = new FormData()
            if (valid) {
                $('.addpostForm').addClass('loader-effect')
                formData.append('postType', this.postType)
                formData.append('content', this.postcontent)
                formData.append('link', this.postlink)
                formData.append('postForGrade', this.postGrade)
                formData.append('postForGroup', this.postCenter)
                formData.append('image', this.postImage)
                const data = await fetchdata(`/teacher/posts`, 'post', formData, false)
                if (data != null) {
                    posts.clearData()
                    posts.closeNewpostBox()
                    this.allposts.push(data.json.newpost)
                    this.renderposts(this.allposts)
                }
                $('.addpostForm').removeClass('loader-effect')
            }

        },
        deletePost: async function (e) {
            var txt;
            if (confirm("Do you want to delete this?")) {
                $(e.target).parents('.post').addClass('loader-effect')
                $(e.target).parents('.post').css({ opacity: .6 })
                const postId = $(e.target).parents('.post').find('input[name="postId"]').val()
                const data = await fetchdata(`/teacher/posts/${postId}`, 'delete', true)
                if (data != null) {
                    $(e.target).parents('.post').fadeOut(300).remove()
                    message('post Deleted', 'success', 'body')
                    posts.allposts = posts.allposts.filter(e => e._id.toString() != postId.toString())
                    if (posts.allposts.length === 0) this.$allpostsBox.append(`<h2 class="fall-back">Start adding new posts..<h2>`)

                }
                $(e.target).parents('.post').removeClass('loader-effect')

            } else {
                e.preventDefault()
            }
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
            const comment = $(e.target).parent(".addComment").find('input[name=comment]').val()
            const data = await fetchdata(`/public/comments/${itemId}`, 'post', JSON.stringify({ comment }), true)
            if (data != null) {
                const c = data.json.comment
                posts.updatecomments(c)
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
                <img src="/${c.by.image}">
                <a href="/public/profile/${c.by._id}">${c.by.name}</a>
                <p>${c.comment}</p>
            </div>
        `)
        },
        closeCommentBox: function (e) {
            $('#allcomments').animate({ height: '0' }, 200, function () {
                $(this).css({ opacity: '0' }).addClass('none')
                $('.comments').empty()
            })
            this.fetchedComments = []
        },
        renderposts: function (posts) {
            console.log(posts);

            $('.fall-back').remove()
            if (posts.length === 0) {

                return this.$allpostsBox.append(`
                    <div class="fall-back">
                    <h3 class="f-center c-b">Start adding new posts..<h3>
                        <img src="/images/postHolder.png" class="postHolder w-50 m-auto block" style="opacity:.5;">
                    </div>
                `)
            }
            displayposts(posts, this.$allpostsBox)
            $(' img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden', height: '30px' })
                }
            })
        },

        openpostSubMenu: function (e) {
            e.stopPropagation()
            $('.post-sub-menu').not($(e.target).parents('.post').find('.post-sub-menu')).removeClass('activeMenu')
            $(e.target).parents('.post').find('.post-sub-menu').toggleClass('activeMenu')
        },
        clearData: function () {
            posts.postType = 'public'
            posts.dateRange = null
            posts.postCenter = ''
            posts.postcontent = ''
            posts.postImage = null
            posts.postGrade = ''
            $('.post-content').val('')
            $('input[type="radio"]').prop('checked', false)
        },
    }
    posts.init()
})()
