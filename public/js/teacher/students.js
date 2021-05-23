/*jslint browser: true*/

/*global console, alert, $, jQuery*/

(function () {
    const studentInterface = {
        allStudents: [],
        // filteredGradeStudents: [],
        // filteredCenterStudents: [],
        // filteredGradeCenterStudents: [],
        teacherClasses: [],
        grade: null,
        center: null,
        studentByNumber: [],
        exams: null,
        openedProfile: null,
        openedExam: null,
        fetchedComments: null,
        pagination: null,

        init: function () {
            this.cashDom()
            this.bindEvents()
        },
        cashDom: function () {
            this.$el = $('#students')
            this.$quickLook = $('#quickLook')
            this.$showFilterBoxBtn = $('.toggle-filter')
            this.$hideFilterBoxBtn = $('.toggle-filter')
            // this.$gradeBtn = $('.filter-grade-students').children('input')
            this.$centerBtn = $('.filter-center-students input')
            this.$gradeCenterBtn = $('.filter-classroom-centers-students input')

            this.$gradeCenterDiv = $('#filter-students-grade-centers')
            this.$searchForm = $('#search-student-number')
            this.$input = $('#search-student-number').find('input[name="sNumber"]')
            this.$search = $('#start-search')
            this.$searchNumberBtn = $('#searchNumberBtn')
            this.teacherId = $('input[name="teacherId"]').val()
        },
        bindEvents: function () {
            // $(window).on('scroll', this.scrollTracker.bind(this))
            this.$showFilterBoxBtn.on('click', this.showFilterBox.bind(this))
            this.$centerBtn.on('click', this.filterCenter.bind(this))
            this.$gradeCenterBtn.on('click', this.filterGradeCenter.bind(this))
            this.$centerBtn.on('dblclick', this.centerOnly.bind(this))
            this.$gradeCenterBtn.on('dblclick', this.gradeOnly.bind(this))
            this.$search.on('click', this.fetchStudents.bind(this))
            $('#sNumber').on('input', this.filterByNumber.bind(this))
            $('body').on('click', '.getProfile', this.openProfile.bind(this))
            $('body').on('click', '.closeWindow', this.closeWindow)
            $('body').on('click', '.lesson.exam', this.openStudentExam.bind(this))
            $('body').on('click', '.lesson.homework', this.openStudentHomework.bind(this))
            $('body').on('click', '.get-attendance', this.getAttendances.bind(this))
            $('body').on('click', '.get-information', this.getinformation.bind(this))
            $('body').on('click', '.print-info', this.printInfo.bind(this))
            $('body').on('click', '.options-buttons .deactivate', this.deactivateAllStudent.bind(this))
            $('body').on('click', '.options-buttons .activate', this.activateAllStudent.bind(this))
            $('body').on('click', '.options-buttons .all-barcodes', this.getallbarcodes.bind(this))
            $('body').on('click', '.changeScore', this.openchangescore.bind(this))
            $('body').on('click', '.change-center', this.openchangecenter.bind(this))
            $('body').on('click', '.submit-center', this.submitcenter.bind(this))
            $('body').on('click', '.deleteLesson', this.deleteTakenExam.bind(this))
            $('body').on('click', '.delete-student', this.deleteStudent.bind(this))
            $('body').on('click', '.reset-password', this.resetPassword.bind(this))
            $('body').on('click', '.expandQ', this.openQuestionBox.bind(this))
            $('body').on('click', '.lessons-list_item_body', this.openQuestionBox.bind(this))
            $('body').on('change', '.lessons-list_item_head input[name="questionScore"]', this.changeQuestionScore.bind(this))
            $('body').on('change', '#myonoffswitch', this.changeStudentstate.bind(this))
            $('body').on('click', '.getBack', this.getBack.bind(this))

            $('#filter-students-classroom-centers input').each(function () { studentInterface.teacherClasses.push({ en: $(this).data('en'), ar: $(this).data('ar') }) })

        },
        showFilterBox: function () {
            $('#filterStudents').toggleClass('none')
        },
        // hideFilterBox: function () {
        //     this.$showFilterBoxBtn.css({ display: 'block' })
        //     $('#filterStudents').css({ display: 'none' }).animate({ opacity: 0 }, 1000)
        // },

        filterCenter: function (e) {
            $('.studentLength').fadeOut()
            this.center = e.target.value
        },
        filterGradeCenter: function (e) {
            $('.studentLength').fadeOut()
            this.grade = e.target.value
        },
        gradeOnly: function (e) {
            this.center = null
            this.grade = e.target.value
            $('input[type="radio"]').not(e.target).prop('checked', false)
        },
        centerOnly: function (e) {
            this.grade = null
            this.center = e.target.value
            $('input[type="radio"]').not(e.target).prop('checked', false)
        },
        filterByNumber: async function (e) {
            e.preventDefault()
            $(".wrapper .loading").removeClass('none')

            $('body').find('input[type="radio"]').not($(e.target)).prop("checked", false)
            $('.studentLength').fadeOut()
            const code = this.$input.val()
            if (!this.isEmptyOrSpaces(code)) {

                const data = await fetchdata(`/teacher/api/students/search?code=${code}`, 'post', JSON.stringify(), true)
                if (data != null) {
                    this.allStudents = data.json.students
                    this.pagination = data.json.pagination
                    this.render(data.json.students, data.json.pagination)
                }
                $(".wrapper .loading").addClass('none')

            }

        },
        fetchStudents: async function (page) {

            if (this.isEmptyOrSpaces(this.grade) && this.isEmptyOrSpaces(this.center)) return message('اختار الذي تريد البحث عنه', 'info', 'body')
            $(".wrapper .loading").removeClass('none')
            const data = await fetchdata(`/teacher/api/students/search`, 'post', JSON.stringify({ classroom: this.grade, center: this.center }), true)
            $(".wrapper .loading").addClass('none')
            if (data != null) {
                this.allStudents = data.json.students
                this.pagination = data.json.pagination
                this.render(data.json.students, data.json.pagination)
            }
        },
        abortAll: function () {
            // copying-an-array-of-objects-into-another-array-in-javascript
            // https://stackoverflow.com/questions/16232915
            var calls = Array.from($.xhrPool);

            $.each(calls, function (key, value) {
                console.log(value);

                value.abort();
            });
        },
        getStudent: function (studentId) {
            const student = this.allStudents.find(s => s._id === studentId)
            this.openedProfile = student
            return student
        },
        deactivateAllStudent: async (e) => {
            if (confirm("Do you want to De-activate all student?")) {
                $('.wrapper').addClass('loader-effect')
                const grade = $('.options-inputs input[name="grade"]').val()
                const center = $('.options-inputs input[name="center"]').val()
                const data = await fetchdata(`/teacher/api/students/activation/all?state=${false}`, 'put', JSON.stringify({ grade: grade, center: center }), true)
                if (data != null) {
                    message('De-Activated', 'info', 'body')
                    $('.wrapper').removeClass('loader-effect')
                    $(`.student`).find('.student-active_icon').removeClass('active')
                    $('.onoffswitch-inner').removeClass('.active')
                    studentInterface.allStudents.forEach(s => s.activated = false)
                    setTimeout(() => {
                        // location.reload();
                    }, 2000);
                } else {
                    $('.wrapper').removeClass('loader-effect')
                }
            } else {
                e.preventDefault()
            }
        },
        activateAllStudent: async (e) => {
            if (confirm("Do you want to Activate all student?")) {
                $('.wrapper').addClass('loader-effect')
                const grade = $('.options-inputs input[name="grade"]').val()
                const center = $('.options-inputs input[name="center"]').val()
                const data = await fetchdata(`/teacher/api/students/activation/all?state=${true}`, 'put', JSON.stringify({ grade: grade, center: center }), true)
                if (data != null) {
                    message('Activated', 'success', 'body')
                    $('.wrapper').removeClass('loader-effect')
                    $(`.student`).find('.student-active_icon').addClass('active')
                    $('.onoffswitch-inner').addClass('.active')
                    studentInterface.allStudents.forEach(s => s.activated = true)
                    setTimeout(() => {
                        // location.reload();
                    }, 2000);
                } else {
                    $('.wrapper').removeClass('loader-effect')
                }
            } else {
                e.preventDefault()
            }
        },
        getallbarcodes: async (e) => {
            $('.wrapper').addClass('loader-effect')
            studentinformation(studentInterface.allStudents)
            $('.information.sheet').removeClass('none')
            $('.information.sheet').animate({ left: 0, opacity: 1 }, 500);
            $('.wrapper').removeClass('loader-effect')

        },
        openProfile: async function (e) {
            this.$quickLook.empty()
            this.$quickLook.removeClass('none')
            this.openedExam = null
            this.openProfile = null
            this.exams = []
            let studentId
            if ($(e.target).hasClass('student')) {
                studentId = $(e.target).find('input[name="studentId"]').val()
            } else {
                studentId = $(e.target).parents('.student').find('input[name="studentId"]').val()

            }

            const student = await studentInterface.getStudent(studentId, this.teacherId)

            displayProfile(student, this.$quickLook, this.teacherId, this.teacherClasses)

            const studentExams = await this.getExams(studentId)
            if (studentExams) {

                this.exams = studentExams.exams
                this.homework = studentExams.homeworks
                $('html, body').animate({ scrollTop: $('#quickLook').offset().top + 10 }, 1000);
                displayExams(studentExams.exams, studentExams.homeworks, this.$quickLook)
            }
        },
        deleteTakenExam: async function (e) {
            var txt;
            $(e.target).parents('.lesson').addClass('loader-effect')
            const { lessonId, studentId } = this.getStudentAndLessonIDs(e)
            const exam = this.exams.find(e => e._id.toString() === lessonId.toString())
            if (confirm("Do you want to delete this?")) {
                const data = await fetchdata(`/teacher/takenexam/${this.openedProfile._id}?examId=${lessonId}&&examType=${exam.examType ? 'exam' : 'homework'}`, 'delete', {}, true)
                if (data) {
                    e.target.parentNode.parentNode.remove();
                    this.exams = this.exams.find(e => e._id.toString() != lessonId.toString())
                    message('Exam Deleted', 'success', 'body')
                }

            } else {
                e.preventDefault()
            }
            $(e.target).parents('.lesson').removeClass('loader-effect')
        },
        deleteTakenHomework: async function (e) {
            var txt;
            $(e.target).parents('.lesson').addClass('loader-effect')
            const { lessonId, studentId } = this.getStudentAndLessonIDs(e)
            if (confirm("Do you want to delete this?")) {
                const data = await fetchdata(`/public/takenhomework/${this.openedProfile._id}?homeworkId=${lessonId}`, 'delete', {}, true)
                if (data) {
                    e.target.parentNode.parentNode.remove();
                    this.homeworks = this.homeworks.find(e => e._id.toString() != lessonId.toString())
                    message('Homework Deleted', 'success', 'body')
                }

            } else {
                e.preventDefault()
            }
            $(e.target).parents('.lesson').removeClass('loader-effect')
        },
        deleteStudent: async function (e) {
            var txt;
            const studentId = $('#quickLook input[name="studentId"]').val()
            if (confirm("Do you want to delete this student?")) {
                $('#quickLook').addClass('loader-effect')

                const data = await fetchdata(`/teacher/api/students/${studentId}`, 'delete', {}, true)
                if (data) {
                    // e.target.parentNode.parentNode.remove();
                    // this.exams = this.exams.find(e => e._id.toString() != lessonId.toString())
                    this.allStudents = this.allStudents.filter(s => s._id.toString() !== studentId.toString())
                    $(`input[value="${studentId}"]`).parents('.student').remove()
                    message('Student Deleted', 'success', 'body')
                    this.closeWindow()
                }
                $('#quickLook').removeClass('loader-effect')

            } else {
                e.preventDefault()
            }
        },
        resetPassword: async function (e) {
            var txt;
            const studentId = $('#quickLook input[name="studentId"]').val()
            if (confirm("Are you sure to reset password this student?")) {
                $('#quickLook').addClass('loader-effect')
                const data = await fetchdata(`/teacher/api/students/info/${studentId}`, 'put', {}, false)
                if (data) {
                    message('Password Reset', 'success', 'body')
                }
                $('#quickLook').removeClass('loader-effect')
            } else {
                e.preventDefault()
            }
        },
        addNewComment: function (e) {
            const lessonId = e.target.parentNode.querySelector('input[name=lessonId]').value
            const studentId = e.target.parentNode.querySelector('input[name=studentId]').value
            const comment = e.target.parentNode.querySelector('input[name=comment]').value
            fetch(`/public/addComment/${lessonId}?studentId=${studentId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment })
            }).then(res => {
                if (res.status === 200) {
                    return res.json()
                } else {
                    studentInterface.showMessage('Something went wrong...', 'alert')
                }

            }).then(resData => {
                studentInterface.fetchedComments.push(resData.comment)
                studentInterface.renderComments(studentInterface.fetchedComments, lessonId, studentInterface.teacherId)


            }).catch(err => {
                console.log(err);

            })

        },
        closeCommentBox: function (e) {
            $('#allcomments').animate({ height: '0', opacity: 0, zIndex: -1 }, 250, function () {
                $('#allcomments').html('')
            })

            return false
        },
        scrollTracker: function () {
            if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                if (this.pagination.hasNextPage) {
                    this.fetchStudents(this.pagination.nextPage);
                } else {
                    $('.fall-back').remove()
                    this.$el.append(`<h3 class="fall-back">No more result..</h3>`)

                }
            }
        },

        getExams: async (id) => {
            $('.allLessons').addClass('loader-effect')
            const data = await fetchdata(`/teacher/api/students/exams/${id}`, 'get', {}, true)
            $('.allLessons').removeClass('loader-effect')
            if (data != null) {
                return data.json
            }

        },
        getStudentAndLessonIDs: (e) => {
            e.stopPropagation()
            let lessonId;
            let studentId;
            if (!$(e.target).hasClass('deleteLesson')) {
                if ($(e.target).hasClass('lesson')) {

                    lessonId = $(e.target).find('input[name="lessonId"]').val()
                    studentId = $(e.target).find('input[name="studentId"]').val()
                } else {
                    lessonId = $(e.target).parents('.lesson').find('input[name="lessonId"]').val()
                    studentId = $(e.target).parents('.lesson').find('input[name="studentId"]').val()
                }
            } else {
                lessonId = $(e.target).parents('.lesson').find('input[name="lessonId"]').val()
                studentId = $(e.target).parents('.lesson').find('input[name="studentId"]').val()

            }
            return { lessonId, studentId }

        },
        filterSingleExam: (lessonId, studentId) => {
            const exam = studentInterface.exams.find(l => l._id.toString() === lessonId.toString())
            studentInterface.openedExam = exam
            return exam
            // studentInterface.openStudentExam(lessonId, studentId, studentInterface.openedExam)
        },
        openStudentExam: function (e) {
            const { lessonId, studentId } = this.getStudentAndLessonIDs(e)
            const exam = this.filterSingleExam(lessonId, studentId)

            displayExam(exam, false)
            //add event listener
            $('#choosenLesson').removeClass('none')
            $('#choosenLesson').animate({
                left: 0,
                opacity: 1
            }, 500, function () {

            });
        },
        filterSingleHomework: (lessonId, studentId) => {
            const exam = studentInterface.homework.find(l => l._id.toString() === lessonId.toString())
            studentInterface.openedExam = exam
            return exam
            // studentInterface.openStudentExam(lessonId, studentId, studentInterface.openedExam)
        },
        openStudentHomework: function (e) {
            console.log('here');

            const { lessonId, studentId } = this.getStudentAndLessonIDs(e)
            const exam = this.filterSingleHomework(lessonId, studentId)

            displayExam(exam, true)
            //add event listener
            $('#choosenLesson').removeClass('none')
            $('#choosenLesson').animate({
                left: 0,
                opacity: 1
            }, 500, function () {

            });
        },
        getAttendances: async function (e) {
            // const data = await fetchdata(`/public/api/students/attendance/${this.openedProfile._id}`, 'get', {}, true)
            // if (data) {
            console.log(this.openedProfile);

            const attendance = this.openedProfile.teachers.find(t => t.teacherId.toString() === this.teacherId.toString())
            attendanceSheet(attendance.attendance)
            $('.attendance.sheet').removeClass('none')
            $('.attendance.sheet').animate({ left: 0, opacity: 1 }, 500);
            // }
        },
        getinformation: function (e) {
            studentinformation([this.openedProfile])
            $('.information.sheet').removeClass('none')
            $('.information.sheet').animate({ left: 0, opacity: 1 }, 500);

        },
        printInfo: function (e) {
            $('.print-info').addClass('none')
            $('.getBack').addClass('none')
            window.print()
            $('body').css({ 'overflow': 'hidden' })
            setTimeout(() => {
                $('.print-info').removeClass('none')
                $('.getBack').removeClass('none')
            }, 6000);
        },
        openchangescore: function (e) {

            $(e.target).parents('.lesson-list_item_head_score').find('input[type="number"]').toggleClass('none')
        },
        changeQuestionScore: async function (e) {
            $(e.target).parent('.lesson-list_item_head_score').find('.points b').removeClass('effect')
            $(e.target).parents('.questionBox').addClass('loader-effect')
            const score = $(e.target).val()

            const questionId = $(e.target).parents('.lessons-list_item').find('input[name="questionId"]').val()
            const lessonId = $(e.target).parents('.lessons-list_item').find('input[name="lessonId"]').val()
            const questionIndex = studentInterface.openedExam.lessonQuestions.findIndex(q => q._id.toString() === questionId.toString())

            const data = await fetchdata(`/teacher/changescore/${lessonId}?questionId=${questionId}&&examType=${studentInterface.openedExam.examType}`, 'put', JSON.stringify({ score: score }), true)
            if (data != null) {
                studentInterface.openedExam.lessonQuestions[questionIndex].point = parseInt(score, 10)
                $(e.target).parents('.lessons-list_item').find('b.points').html(score).addClass('effect')
            }
            $('.questionScore').addClass('none')
            $(e.target).parents('.questionBox').removeClass('loader-effect')

        },

        openchangecenter: function (e) {
            const teacher = this.openedProfile.teachers.find(t => t.teacherId.toString() === this.teacherId.toString())
            $('select[name="center"]').val(teacher.center).trigger('change')
            $('.changecenter').toggleClass('none')


        },
        submitcenter: async function (e) {
            e.preventDefault()
            const center = $('.changecenter select').val()
            const studentId = studentInterface.openedProfile._id

            if (studentInterface.isEmptyOrSpaces(center)) return message('اختار المجموعه', 'warning', 'body')
            if (!studentInterface.openedProfile) return message('اختار الطالب', 'info', 'body')
            if (!studentId) return message('برجاء اعاده تحميل الصفحه', 'warning', 'body')
            $('.changecenter').addClass('loader-effect')

            const data = await fetchdata(`/teacher/changecenter/${studentId}`, 'put', JSON.stringify({ center: center }), true)
            if (data != null) {
                message('Changed', 'success', 'body')
                $('.student-center').html(center)

                studentInterface.openedProfile.center = center
                const studenindex = studentInterface.allStudents.findIndex(s => s._id.toString() === studentId.toString())
                if (studenindex) studentInterface.allStudents[studenindex].center = center

                $('.changecenter').removeClass('loader-effect')
                return $(`.student input[value="${studentId}"]`).parents('.student').find('.mini-bar span:nth-child(2)').html(`Center: ${center}`)
            }


        },
        isEmptyOrSpaces: (str) => str === null || str.match(/^ *$/) !== null,

        changeStudentstate: async function (e) {
            const state = $(e.target).prop('checked')
            const studentId = $(e.target).parents('#quickLook').find('input[name="studentId"]').val()
            if (studentId) {
                $('.quickLook-header').addClass('loader-effect')
                const data = await fetchdata(`/public/api/students/active/${studentId}?state=${state}`, 'put', {}, false)
                if (data != null) {
                    const index = this.allStudents.findIndex(s => s._id.toString() == studentId.toString())
                    const teacheridx = this.allStudents[index].teachers.findIndex(t => t.teacherId.toString() === this.teacherId.toString())
                    this.allStudents[index].teachers[teacheridx].active = state

                    $(`.student input[value="${studentId}"]`).parents('.student').find('.student-active_icon').toggleClass('active')
                    if (state == true) {
                        $(e.target).parents('.onoffswitch').find('.onoffswitch-inner').addClass('active')
                    } else {
                        $(e.target).parents('.onoffswitch').find('.onoffswitch-inner').removeClass('active')
                    }
                }
                $('.quickLook-header').removeClass('loader-effect')

            }

        },
        openQuestionBox: function (e) {
            const questionId = $(e.target).parents('.lessons-list_item').find('input[name="questionId"]').val()
            const question = studentInterface.openedExam.lessonQuestions.find(q => { return q._id.toString() === questionId.toString() })
            const answersBox = $(e.target).parents('.lessons-list_item').find('.answerBox')

            if (!answersBox.has('.answer').length > 0) {
                answersBox.append(`<img src="/${question.questionImg}">`)
                question.answers.forEach(a => { if (a.answer != 'null') { answersBox.append(`<p class="answer">${a.answer}</p>`) } })
            } else {
                answersBox.empty()
            }

        },
        render: function (students, pagination) {
            console.log(students);

            $('.fall-back').remove()
            $('.student').remove()
            if (students.length > 0) {
                displayStudents(students, studentInterface.teacherId)
                // displayoptions(studentInterface.grade, studentInterface.center, students.length)
            } else {
                this.$el.append(`<h3 class="fall-back">لا يوجد شئ هنا</h3>`)
            }
        },
        createBarcode: async function (itemId) {

            // canvas.toBlob(function (blob) {
            //     var createdurl = URL.createObjectURL(blob);
            //     const newImg = document.createElement('img')
            //     newImg.style.maxWidth = '100%'
            //     newImg.onload = function () {
            //         // no longer need to read the blob so it's revoked
            //         URL.revokeObjectURL(createdurl);
            //     };
            //     newImg.src = createdurl;
            //     inventory.convertToBlob(blob, 'NEWANSWEFORSTUDNET', itemId)
            // })
        },
        getBack: function (e) {
            $('.sheet .all-items').empty()
            $(e.target).parent('.sheet').animate({
                opacity: 0.25,
                left: `-${$(e.target).parent().width() + 50}`,
            }, 500, function () {
                this.openedExam = null
                $(e.target).parent('.sheet').addClass('none')
            });
            $('body').css({ 'overflow': 'scroll' })

        },
        closeWindow: function () {
            studentInterface.$quickLook.empty()
            studentInterface.$quickLook.addClass('none')
            this.exams = []
            this.openedExam = null
            this.openedProfile = null
            $('.changecenter').addClass('none')
        },
    }
    studentInterface.init()
})()
