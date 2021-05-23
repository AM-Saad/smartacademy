/*jslint browser: true*/

/*global console, alert, $, jQuery*/



(function () {
    const units = {

        allUnits: [],
        unitimg: null,
        init: function () {
            this.cashDom()
            this.bindEvents()
        },
        cashDom: function () {
            this.$el = $('#teacher-units')
            this.$classroomBtn = $('.filter-classroom-item').children('input')
            this.$termDiv = $('#filter-term')
            this.$termBtn = $('.filter-term-item').children('input')
            this.$searchname = $('.search-name')
        },
        bindEvents: function () {
            this.$classroomBtn.on('click', this.filterclassroom.bind(this))
            this.$termBtn.on('click', this.filterTerm.bind(this))
            this.$searchname.on('keyup', this.searchname.bind(this))

        },

        filterclassroom: function (e) {
            const classroom = e.target.value
            this.$classroomBtn.removeAttr('checked')
            e.target.setAttribute('checked', true)
            $('input[name="term"]').prop('checked', false)
            $('.card').addClass('none')
            if (classroom === 'all') {
                $('.card').removeClass('none')
            } else {
                $(`.card[data-classroom=${classroom}]`).removeClass('none')
            }
            // displayUnits([], this.$el)
        },
        filterTerm: function (e) {
            const term = e.target.value
            const classroom = $('input[name="grade"]:checked').val()
            $('.card').addClass('none')


            if (classroom === 'all') {
                $(`.card[data-term=${term}]`).removeClass('none')
            } else {
                $(`.card[data-term=${term}][data-classroom=${classroom}]`).removeClass('none')

            }
        },
        searchname: function (e) {
            var str = event.target.value.toLowerCase()
            $('input[type="radio"]').prop('checked', false)

            if (this.isEmptyOrSpaces(str)) {
                $('#all').prop('checked', true)
                // return displayUnits(this.allUnits, this.$el)
            }
            var filteredArr = this.allUnits.filter((i) => {
                var xSub = i.unitDetails.name.toLowerCase()
                return i.unitDetails.name.toLowerCase().includes(str) || this.checkName(xSub, str)
            });
            // displayUnits(filteredArr, this.$el)
        },
        checkName: (name, str) => {
            var pattern = str.split("").map((x) => { return `(?=.*${x})` }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
       
   
    }


    units.init()
})()
