/*jslint browser: true*/

/*global console, alert, $, jQuery*/




(function () {

    const centersConfig = {
        centers: [],
        init: function () {
            this.cashDom()
            this.bindEvents()
            // this.render()

        },
        cashDom: function () {
            this.$el = $('#addCenter')
            this.$input = this.$el.find('input[name=newCenter]')
            this.$centerId = this.$el.find('input[name=centerId]')
            this.$centerName = this.$el.find('input[name=centerName]')
            this.$button = $('#addNewCenter')
            this.$select = this.$el.find('.centers')
            this.$deleteBtn = $('.deleteCenter')

        },
        bindEvents: function () {
            this.$deleteBtn.on('click', this.removeCenter.bind(this))
            this.$button.on('click', this.addCenter.bind(this))
        },
        render: function (c) {

            this.$select.append(
                `
                <li class="list-group-item">
                 ${c}
                    <input type="hidden" value="${c}" name="${c}" />
                    <button class="deleteCenter btn btn-sm btn-danger float-right">Delete</button>
                 <li>
                `
            )
        },
        showMessage: function (message) {
            this.$el.prepend(`<p class="alert alert-${message.messageType}">${message.message}</p>`)
        },
        addCenter: function () {
            $('.alert').remove()

            $('#addCenter').addClass('loader-effect')
            fetch(`/teacher/centers/${this.$input.val()}`, {
                method: 'POST'
            }).then(res => {
                if (res.status === 200) {

                    this.render(this.$input.val())
                    this.$input.val('')
                }
                $('#addCenter').removeClass('loader-effect')

                return res.json()

            }).then(resData => {
                return this.showMessage(resData)

            }).catch(err => {
                console.log(err);

            })
        },
        removeCenter: function (e) {
            $('#addCenter').addClass('loader-effect')

            $('.alert').remove()
            fetch(`/teacher/centers/${e.target.parentNode.children[1].value}`, {
                method: 'delete'
            }).then(res => {
                console.log(res);
                if (res.status === 200) {
                    e.target.parentNode.remove()

                    this.$input.val('')
                    this.centers.pop(this.$input.val())
                    console.log($('.centers .list-group-item').length);

                    if ($('.centers .list-group-item').length == 0) {
                        this.$el.append(`<p class="alert">لا يوجد مجموعات لديك</p>`)
                    }
                }
                $('#addCenter').removeClass('loader-effect')

                return res.json()

            }).then(resData => {
                return this.showMessage(resData)

            }).catch(err => {
                console.log(err);

            })
        }
    }
    centersConfig.init()
})()