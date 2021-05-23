/*jslint browser: true*/




(function () {
    const lessonConfig = {
        exam: null,
        editing: false,
        questionId: null,
        allQuestions: [],
        symbols: new Array("&#8730;", "&#8804;", "&#8805;", "&#8773;", "&#8835;", "	&#8834;", "&#8839;", "&#8838;", "&#8836;", "&#9674;", "&#8592;", "&#8594;", "&#8593;", "&#8595;", "&#8596;", "&#176;", "&#177;", "&#188;", "&#189;", "&#190;", "&#8734;", "&#8736;", "&#8743;", "&#8744;", "&#8756;", "&#9668;", "&#9658;", "&#9650;", "&#9660;"),
        targetInput: 'questionText',
        questionType: 'choose',
        questionScore: '',
        questionText: '',
        questionImg: '',
        answerone: '',
        answertwo: '',
        answerthree: '',
        answerfour: '',
        correctAnswer: '',
        itemId: $('input[name="itemId"]').val(),
        examType: $('input[name="type"]').val(),

        selectedCenter: null,
        init: async function () {
            const r = await this.getExam()
            if (r === true) {
                return this.readyStatus()
            } else {
                return window.location.href = '/'
            }
        },
        cashDom: function () {
            this.$questionForm = $('#NewQuestionForm')
            this.tabsBtn = $('.tabs-list li')
            this.$addQuestionBtn = $('#addQuestion')
            this.$closeQuestionForm = $('#closeQuestionForm')
            this.$questionFormInputs = $('#NewQuestionForm').find('input')
            this.$questionperview = $('.question-perview')
            this.$questionsInputs = $('.questionsInputs')
            this.$textFormater = $('#textFormater')
            this.$addInput = $('#addInput')
            this.$questionImg = $('.questionImg')
            this.$questionBox = $('.question-list_item')


            this.centers = $('#toggle-centers')
            this.search = $('#search')
            this.chooseCenter = $('.form-check-input')
        },
        bindEvents: function () {
            this.$addQuestionBtn.on('click', this.openForm.bind(this))
            $('.delete-question').on('click', this.deleteQuestion.bind(this))
            $('.edit-question').on('click', this.editQuestion.bind(this))
            this.$closeQuestionForm.on('click', this.closeForm.bind(this))
            this.tabsBtn.on('click', this.getQuestionType.bind(this))
            this.$questionsInputs.on('click', this.selectInput.bind(this))
            this.$addInput.on('click', this.addInput.bind(this))
            this.$questionImg.on('change', this.getImgFile.bind(this))
            $('body').on('click', '.remove-img', this.removeImg.bind(this))
            $('.toggle-settings').on('click', () => { $('.settings').toggleClass('none') })
            $('body').on('click', '.submitQuestion', this.submitQuestion.bind(this))
            $('body').on('click', '.question-sub-menu-btn', this.openSubMenu.bind(this))
            $('body').on('click', '.question-list_item', this.openQuestionAnswers.bind(this))
            $('body').on('click', '.ql-editor', lessonConfig.checkActiveInput.bind(this))
            $('body').on('click', '.closeCorrectAnswer', function () { $('.correctAnsweBox').remove() })
            $('body').on('click', '#truefalseInput input', function (e) { $('#truefalseInput input').not($(e.target)).prop("checked", false) })

            $('body').on('click', '.symbol', this.addTextToElement.bind(this))


            this.centers.on('click', this.toggleCenters.bind(this))
            this.chooseCenter.on('click', this.getCenter.bind(this))
            $('.toggle-analytics').on('click', () => { $('.monthly-analytics').toggleClass('slide') })
            this.search.on('click', this.getTakenStudents.bind(this))

        },
        getExam: async function () {
            let { json } = await fetchdata(`/teacher/exam/api/${this.itemId}?examType=${this.examType}`, 'get', {}, true);
            if (json != null) {
                this.allQuestions = json.questions
                displayinformation(json.exam)
                displayquestions(this.allQuestions)
                return true
            } else {
                return false
            }
        },

        readyStatus: () => {
            lessonConfig.cashDom()
            lessonConfig.bindEvents()
            $('#holders').css({ display: 'none' }).remove()
            var toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                // [{ 'header': 1 }, { 'header': 2 }], 
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                // [{ 'indent': '-1' }, { 'indent': '+1' }],    
                // [{ 'direction': 'rtl' }],                        
                // [{ 'size': ['small', false, 'large', 'huge'] }], 
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
            ];
            new Quill('.editor', {
                modules: {
                    toolbar: toolbarOptions
                },
                theme: 'snow',
            });
            $('.ql-editor').addClass('mainContent')
            $('.ql-editor').attr('tabindex', "0")
            $('.ql-editor').attr('direction', "rtl")

            lessonConfig.renderSymbols()
            $('.header').animate({ opacity: 1 }, 500)
            $('#openSymbols').on('click', function () { $('#symbols').toggle() })
            $('img').each(function () {
                if ($(this).attr('src') == '/undefined' || $(this).attr('src') == '/') {
                    $(this).css({ visibility: 'hidden', height: '30px' })
                }
            })

        },
        renderSymbols: function () {
            lessonConfig.symbols.forEach((s, i) => { $('#symbols').append(`<button class="symbol" data-i="${i}">${s}</button>`) })
        },
        openForm: function () {
            this.$questionForm.removeClass("none");
            lessonConfig.checkActiveInput()
        },
        closeForm: function () {
            this.$questionForm.addClass("none");
            this.resetData()
        },
        addTextToElement: function (e) {
            const element = $('.mainContent')
            const insertText = lessonConfig.symbols[$(e.target).data('i')]
            $(element).append(insertText)
        },
        addSymbolToElement: function (e) {
            const element = $('.mainContent')
            const insertText = lessonConfig.symbols[$(e.target).data('i')]
            var originalContent = element.innerHTML;

            var selection = document.getSelection();
            var range = selection.getRangeAt(0);

            var originalStart = range.startOffset;
            var originalEnd = range.endOffset;

            var front = originalContent.substring(0, originalStart);
            var back = originalContent.substring(originalEnd, originalContent.length);

            element.innerHTML = front + insertText + back;
        },
        preventParagraph: function (e) {
            const key = e.which || e.keyCode
            if (key == 13) {
                if ($('.mainContent')) {
                    console.log('exost');
                } else {
                    console.log('not');
                }
            }
        },
        checkActiveInput: function (e) {
            if (lessonConfig.targetInput === '') {
                $('.confirm-question').removeClass('submitQuestion')
                return lessonConfig.alertButtons()
            }

            if (lessonConfig.questionType === 'choose') {
                if (lessonConfig.questionText === '' || lessonConfig.answerone === '' || lessonConfig.answertwo === '' || lessonConfig.answerthree === '' || lessonConfig.answerfour === '' || lessonConfig.correctAnswer === '') {
                    $('.confirm-question').css({ opacity: .3 })
                    return $('.confirm-question').removeClass('submitQuestion')
                } else {
                    $('.confirm-question').css({ opacity: 1 })
                    return $('.confirm-question').addClass('submitQuestion')
                }
            } else {
                if (lessonConfig.questionType === 'truefalse') {
                    if (lessonConfig.questionText === '' || lessonConfig.correctAnswer === '') {
                        $('.confirm-question').css({ opacity: .3 })
                        return $('.confirm-question').removeClass('submitQuestion')
                    } else {
                        $('.confirm-question').css({ opacity: 1 })
                        return $('.confirm-question').addClass('submitQuestion')
                    }
                } else {
                    if (lessonConfig.questionText === '') {
                        $('.confirm-question').css({ opacity: .3 })
                        return $('.confirm-question').removeClass('submitQuestion')
                    } else {
                        $('.confirm-question').css({ opacity: 1 })
                        return $('.confirm-question').addClass('submitQuestion')
                    }
                }
            }
        },
        selectInput: function (e) {
            $('.questionsInputs').removeClass('inputActive')
            this.targetInput = $(e.currentTarget).data('id')
            $(e.currentTarget).addClass('inputActive')
            $('.mainContent').html(lessonConfig[this.targetInput])
            $('.ql-editor p').click()

            if (this.targetInput === 'correctAnswer') {
                if (this.questionType === 'truefalse') {
                    $('#textFormater').append(`
                    <div class="correctAnsweBox" >
                        <i class="fas fa-times closeCorrectAnswer"></i>
                        <form id="truefalseInput">
                            <div class="flex">
                                <div class="m-r-3">
                                    <input type="checkbox" id="true" class="form-control" value="1">
                                    <label for="true">صح</label>
                                </div>
                                <div class="m-l-3">
                                    <input type="checkbox" id="false" class="form-control" value="0">
                                    <label for="false">خطأ</label>
                                </div>
                            </div>
                        </form>
                    </div>`)
                } else {

                    $('#textFormater').append(`
                            <div class="correctAnsweBox">
                                <i class="fas fa-times closeCorrectAnswer"></i>
                                <input type="number" class="form-control" min="1" max="4" id="correctAnswerInput" placeholder=" رقم الاجابه الصحيحه">
                            </div>
                    `)
                }

                $('#correctAnswerInput').focus()
            } else if (this.targetInput === 'questionScore') {
                $('#textFormater').append(`
                    <div class="correctAnsweBox" >
                    <i class="fas fa-times closeCorrectAnswer"></i>
                        <input type="number" class="form-control" min="1" id="questionScoreInput" placeholder="اضف نقاط السؤال">
                    </div>`)
                $('#questionScoreInput').focus()
            } else {
                $('.ql-editor.ql-blank').focus()
                $('.correctAnsweBox').remove()
            }
        },
        addInput: function () {
            if (isEmptyOrSpaces(this.targetInput)) return message('اختر عنصر للأضافه', 'info', 'body')

            const targtedInput = this.targetInput

            if (this.targetInput === 'correctAnswer') {
                let answer = this.questionType === 'truefalse' ? $('#truefalseInput input:checked').val() : $('input#correctAnswerInput').val()

                if (answer === undefined || isEmptyOrSpaces(answer)) return message("اضف الاختيار الصحيح", 'info', 'body')
                if (this.questionType === 'choose' && answer == 0 || answer > 4) return message("رقم الاجابه يكون ان يكون من 1 الي 4", 'info', 'body')

                lessonConfig[targtedInput] = answer

                $('.question-perview_head span').html(`الأجابه الصحيحه :${this.questionType != 'choose' ? answer != 0 ? 'صح' : 'خطأ' : answer}`)
                $('.correctAnsweBox').remove()

            } else if (this.targetInput === 'questionScore') {
                const questionScore = $('input#questionScoreInput').val()
                if (isEmptyOrSpaces(questionScore)) return message("اضف نقاط السؤال", 'info', 'body')
                if (questionScore == 0) return message("نقاط الاجابه يجب ان يكون علي الاقل 1 ", 'info', 'body')
                lessonConfig[targtedInput] = questionScore
                $('.question-perview_head span').html(`نقاط السؤال :${questionScore}`)
                $('.correctAnsweBox').remove()
            } else {
                const inputsVal = $('.ql-editor').html();
                if (isEmptyOrSpaces(inputsVal), inputsVal === '<br>' || inputsVal == '<p><br></p>') return message("تأكد من اختيار العنصر و ملأه قبل الاضافه", 'info', 'body')
                lessonConfig[targtedInput] = inputsVal
                $('#' + targtedInput).html(inputsVal)
                $('.ql-editor p').html('').click()
            }


            $(`[data-id=${targtedInput}] i`).addClass('fulfilled')
            $(`[data-id=${targtedInput}]`).removeClass('inputActive')
            const nextElement = $('#' + targtedInput).next().attr('id')
            $(`[data-id=${nextElement}]`).click()
            this.checkActiveInput()
            $('.ql-editor.ql-blank').focus()
            $('.ql-editor p').click()

        },
        getQuestionType: function (e) {

            this.questionType = $(e.currentTarget).data('questiontype')

            this.targetInput = ''
            $('.questionsInputs').removeClass('inputActive')
            $('.question-perview_head span').html('')

            if (this.questionType == 'choose' || this.questionType == 'truefalse') $('.question-perview_head p').html('الأجابه الصحيحه:')
            if (this.questionType != 'truefalse' && this.questionType != 'choose') $('.question-perview_head p').html('نقاط السؤال:')

            this.resetData()
            return lessonConfig.checkActiveInput()
        },
        getImgFile: function (e) {
            let photo = e.target.files[0];  // file from input
            this.questionImg = photo
            $(`[data-id=image] i`).addClass('.fulfilled')
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => $('.question_preview_image img').attr('src', e.target.result);
                reader.readAsDataURL(e.target.files[0]);
            }
            this.checkActiveInput()

            $('.question_preview_image').removeClass('none')

        },
        removeImg: function (e) {
            $('.question_preview_image img').attr('src', '');
            $('.question_preview_image').addClass('none')
            lessonConfig.questionImg = ''
        },
        alertButtons() {
            $('.questionsInputs').addClass('inputActive')
            setTimeout(() => { $('.questionsInputs').removeClass('inputActive') }, 1000);
        },
        validateQuestion() {
            if (lessonConfig.questionType === 'choose') {
                if (lessonConfig.questionText === ''
                    || lessonConfig.answerone === ''
                    || lessonConfig.answertwo === ''
                    || lessonConfig.answerthree === ''
                    || lessonConfig.answerfour === ''
                    || lessonConfig.correctAnswer === '') {
                    message('لا تترك اي حقل فارغ', 'warning', 'body')
                    return false
                }
            } else {
                if (lessonConfig.questionText === '') {
                    lessonConfig.alertButtons()
                    message('لا تترك اي حقل فارغ', 'warning', 'body')
                    return false
                }
            }
            return true
        },
        createQuestionForm() {
            let formData = new FormData();
            if (lessonConfig.questionType === 'choose') {
                formData.append("image", lessonConfig.questionImg);
                formData.append("answer1", lessonConfig.answerone);
                formData.append("answer2", lessonConfig.answertwo);
                formData.append("answer3", lessonConfig.answerthree);
                formData.append("answer4", lessonConfig.answerfour);
                formData.append("correctAnswer", parseInt(lessonConfig.correctAnswer, 10));
                formData.append("question", lessonConfig.questionText);
            } else if (lessonConfig.questionType === 'truefalse') {
                formData.append("image", lessonConfig.questionImg);
                formData.append("question", lessonConfig.questionText);
                formData.append("correctAnswer", parseInt(lessonConfig.correctAnswer, 10));
            } else {
                formData.append("image", lessonConfig.questionImg);
                formData.append("question", lessonConfig.questionText);
                formData.append("questionScore", parseInt(lessonConfig.questionScore, 10))
      

            }
            return formData
        },
        submitQuestion: async function (e) {
            $('.confirm-question').removeClass('submitQuestion')
            $('#NewQuestionForm').addClass('loader-effect')
            e.preventDefault()
            const valid = lessonConfig.validateQuestion()

            if (valid) {
                $('.confirm-question').css({ opacity: .25 })
                const form = lessonConfig.createQuestionForm()

                let data;
                if (lessonConfig.editing) {
                    data = await fetchdata(`/teacher/exam/questions/${lessonConfig.itemId}?questionId=${lessonConfig.questionId}&&examType=${lessonConfig.examType}`, 'put', form, false);
                } else {
                    data = await fetchdata(`/teacher/exam/questions/${lessonConfig.itemId}?type=${lessonConfig.questionType}&&examType=${lessonConfig.examType}`, 'post', form, false);
                }
                if (data != null) {
                    message('تم أضافه السؤال', 'success', 'body')
                    lessonConfig.allQuestions = data.json.questions
                    displayquestions(data.json.questions)
                                 

                }
           lessonConfig.editing = false
                lessonConfig.closeForm()
                lessonConfig.questionId = null
                $('#NewQuestionForm').removeClass('loader-effect')

                return lessonConfig.resetData()
            }
        },
        resetData: function () {
            lessonConfig.questionText = ''
            lessonConfig.questionImg = ''
            lessonConfig.targetInput = ''
            lessonConfig.answerone = ''
            lessonConfig.answertwo = ''
            lessonConfig.answerthree = ''
            lessonConfig.answerfour = ''
            lessonConfig.correctAnswer = ''
            lessonConfig.questionScore = '' // Update in prodction 28/9
     
            $('.questionsInputs').removeClass('inputActive')
            $('.question-perview p').html('')
            $('.question_preview_image').attr('src', '')
            $('.submitQuestion').css({ opacity: .25 })
            $('.confirm-question').removeClass('submitQuestion')
            $('.ql-editor p').html('')
            $('.correctAnsweBox').remove()
            $('.fa-check-circle').removeClass('fulfilled')
            $('.tabs-list').removeClass('none')

            lessonConfig.RefreshSomeEventListener()
        },
        RefreshSomeEventListener: function () {

            // Remove handler from existing elements
            $(".edit-question").off();
            $(".delete-question").off();

            // Re-add event handler for all matching elements
            $(".delete-question").on("click", lessonConfig.deleteQuestion)
            $(".edit-question").on("click", lessonConfig.editQuestion)
        },
        openQuestionAnswers: function (e) {

            const expandIcon = $(e.currentTarget).find('.expandQ')
            const answersBox = $(e.currentTarget).find('.answerBox')
            expandIcon.toggleClass("fa-sort-down fa-sort-up");
            answersBox.toggleClass('collapsed')

        },

        openSubMenu: function (event) {
            $(event.target).parent().find('.question-list_item-sub-list').fadeIn(300)
            $(".wrapper").on('click', function () { $('.question-list_item-sub-list').fadeOut(); });
            $(".question-list_item-sub-list").click(function (e) { e.stopPropagation(); });
        },
        editQuestion: function (e) {
            lessonConfig.editing = true
            const questionId = $(e.target).parents('.question-list_item').find("input[name=questionId]").val();
            lessonConfig.questionId = questionId
            const question = lessonConfig.allQuestions.find(q => q._id.toString() == questionId.toString())
            lessonConfig.showEditQuestionData(question)
            lessonConfig.openForm()
            $('.confirm-question').css({ opacity: 1 })
            $('.confirm-question').addClass('submitQuestion')

        },
        showEditQuestionData(question) {
            if (question) {

                const tabbutton = $(`li[data-questiontype="${question.questionType}"]`)
                tabbutton.trigger('click')
                $(`[data-tab-content=${tabbutton.data('content')}]`).find('.questionsInputs i').addClass('fulfilled')
                $('.tabs-list').addClass('none')


                if (question.questionImg) {
                    $('.question_preview_image img').attr('src', '/' + question.questionImg);
                    $('.question_preview_image').removeClass('none')
                    this.questionImg = ''
                } else {
                    $('.question_preview_image img').attr('src', '');
                    $('.question_preview_image').addClass('none')
                    this.questionImg = ''
                }

                $('#questionText').html(question.question)
                lessonConfig.questionText = question.question
                lessonConfig.correctAnswer = question.correctAnswer


                if (question.questionType == 'choose') {
                    question.answers.forEach(a => {
                        const element = $("p[data-number='" + a.answerNo + "']")
                        element.html(a.answer)
                        lessonConfig[element.attr('id')] = a.answer
                    })
                } else if (question.questionType == 'truefalse') {
                    lessonConfig.questionScore = 1
                    $('.question-perview_head p').html('الأجابه الصحيحه:')
                    $('.question-perview_head span').html(question.correctAnswer == 1 ? 'صح' : 'خطأ')
                } else {
                    lessonConfig.questionScore = question.questionScore
                    $('.question-perview_head p').html('نقاط السؤال:')
                    $('.question-perview_head span').html(question.questionScore)
                }

            }

        },
        deleteQuestion: async function (e) {
            var txt;
            if (confirm("هل انت متأكد امك تريد حذف هذاالسؤال")) {
                $('body')
                $(e.target).parents('.question-list_item').css({ opacity: .5 })
                const questionId = $(e.target).parents('.question-list_item').find("input[name=questionId]").val();
                const data = await fetchdata(`/teacher/exam/questions/${lessonConfig.itemId}?questionId=${questionId}&&examType=${lessonConfig.examType}`, 'delete', null, true)
                if (data != null) {
                    lessonConfig.allQuestions = lessonConfig.allQuestions.filter(q => q._id.toString() != questionId.toString())
                    $(e.target).parents('.question-list_item').remove()
                    message('تم حذف السؤال', 'success', 'body')
                }
            } else {

                e.preventDefault()
            }

        },

        toggleCenters: function (e) {
            $('#centers').toggleClass('none')
            // analytics.displayChart(Object.keys(orderPerMonth), Object.values(orderPerMonth))
        },
        getCenter: function (e) {
            this.selectedCenter = e.target.value
        },
        getTakenStudents: async () => {
            $('.questions-report .loading').removeClass('none')
            const center = lessonConfig.selectedCenter
            if (!center) return message('Choose Center', 'info', 'body')
            const data = await fetchdata(`/public/api/search/exams/${lessonConfig.itemId}?center=${center} `, 'put', JSON.stringify({ center: center }), true)
            if (data) {
                lessonConfig.questionAnalytics(data.json.exams)
            }
            $('.questions-report .loading').addClass('none')


        },
        questionAnalytics: function (exams) {
            const questions = lessonConfig.allQuestions.map(q => ({
                _id: q._id,
                question: q.question,
                score: q.questionScore,
                correct: 0,
                taken: 0
            }))
            exams.forEach(e => {
                e.lessonQuestions.forEach(qs => {
                    const qstidx = questions.findIndex(q => q._id.toString() === qs._id.toString())
                    questions[qstidx].taken += 1
                    questions[qstidx].correct = qs.point === questions[qstidx].score ? questions[qstidx].correct += 1 : questions[qstidx].correct
                })
            })
            let maxQuestion = questions.reduce((max, i) => max.correct > i.correct ? max : i);
            let minQuestion = questions.reduce((min, i) => min.correct < i.correct ? min : i);
            questionmesure(questions, maxQuestion, minQuestion)
        },

    }
    lessonConfig.init()
})()
