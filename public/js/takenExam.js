/*jslint browser: true*/
/*global console, alert, $, jQuery*/



(function () {
    const getExams = {

        allLessons: [],
        fetchedComments: [],
        isSame: false,
        isTeacher: false,
        openedExam: null,
        examId:$('#examId').val(),
        init: function () {
            this.cashDom()
            this.getExam()
            // this.bindEvents()
        },
        cashDom: function () {
            this.$el = $('#allLessons')
            this.$loading = $('#allLessons .loading')
            this.$studentId = $('input[name="student"]').val()
            this.$teacher = $('input[name="teacher"]').val()
            this.commentsDev = document.getElementById('allcomments')
            $('body').on('click', '.getBack', this.getBack.bind(this))
            $('body').on('click', '.lessons-list_item_body', this.getQuestionAnswers.bind(this))

        },
        getBack: function (e) {
            $('.sheet .all-items').empty()
            $(e.target).parents('.sheet').animate({
                opacity: 0.25, left: `-${$(e.target).parent().width() + 50}`,
            }, 500, function () {
                this.openedExam = null
                $(e.target).parents('.sheet').addClass('none')
            });
        },
        getExam: async function () {
          

            $('.loading').removeClass('none')
            const data = await fetchdata(`/preview-exam/${this.examId}`, 'get', {}, true)
            if (data != null) {
                console.log(data.json.exam);
                
                displayExam(data.json.exam, false)

            }else{
                window.history.back
            }
            $('.loading').addClass('none')


        },
   
        render: function (studentExams) {
            if (studentExams.length === 0) return this.$el.append(` <p style="font-size:22px; color:#ffeb7a; padding:10px;">No Taken Exams Yet..</p> `)
            displayExams(studentExams, true, getExams.isSame)
            $('#allLessons img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden' })
                }
            })
        },


        getQuestionAnswers: function (e) {
            console.log(e);
            
            const expandIcon = $(e.currentTarget).find('.expandQ')
            const answersBox = $(e.currentTarget).find('.answerBox')
            expandIcon.toggleClass("fa-sort-down fa-sort-up");
            answersBox.toggleClass('collapsed')

        },

    }
    getExams.init()
})()
