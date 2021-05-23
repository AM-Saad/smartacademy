function displayStudents(students, teacherId) {
    console.log(students);

    students.forEach(s => {
        let teacher = s.teachers.find(t => t.teacherId.toString() === teacherId.toString())
        $('#students').append(
            `  
            <div class="student getProfile rounded-lg" style="opacity:0;">
                <div class="student-active_icon ${teacher.active ? 'active' : ''}"></div>
                <img class="student-img img-fluid" src="/${s.image || 'images/student_img.png'}" alt="">
                <h5> ${s.name}</h5>
                 <h6>الاختبارات:${s.exams.length + s.homeworks.length}</h6>

                <input type="hidden" name="studentId" value="${s._id}">
            </div>
                `
        )
    })
    $('.student').animate({ opacity: 1 }, 200)

}

function displayProfile(student, profile, teacherId, teacherclasses) {
    const teacher = student.teachers.find(t => t.teacherId.toString() === teacherId.toString())
    profile.append(`
            <i id="" style="cursor:pointer;" class="fas fa-times close closeWindow c-w"></i>
            <input type="hidden" value="${student._id}" name="studentId" >
            <div>
                <div class="quickLook-header p-relative">
                        <div>
                            <img src="/${student.image || 'images/student_img.png'}">
                        </div>
                        <div>
                            <ul class="profile-header_list list-group list-group-horizontal-xl">
                                <h3>${student.name}</h3>
                                <p>الموبيل: <a class="c-gray" target="_blank" href="https://wa.me/02${student.mobile}"> ${student.mobile}</a></p>
                                <p>رقم ولي الامر: ${ `<a class="c-gray" target="_blank" href="https://wa.me/02${student.parentNo}"> ${student.parentNo}</a>` || ''}</p>
                                <p>المدرسه: ${student.school || ''}</p>
                                <p>الاختبارات :${student.exams.length + student.homeworks.length}</p>
                                <div class="flex f-space-start">
                                    <li class="list-group-item m-r-3">الصف الدراسي: ${teacherclasses.find(c => c.en === student.classroom).answer}</li>
                                    <li class="list-group-item "> المجموعه: <span class="student-center"> ${teacher.center}</span> </li>
                                </div>
                            </ul>
                            <div class="flex f-start">
                                <div class="profile-header_actions flex">
                                    <a class="whatsapp-btn m-l-3" target="_blank" href="https://wa.me/02${student.mobile}">
                                        <img src="/images/whatsapp.svg">
                                    </a>
                                    <a class="change-center m-l-3">
                                        <i class="fas fa-cogs"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                     
                    </div>
                </div>
            <div class="dynamic-tabs">
                <ul class="tabs-list flex f-space-around m-4">
                  <li class="active btn-wrapper" data-content="content-one">
                    <button class="btn-main active">الامتحانات</button>
                  </li>
                  <li class="btn-wrapper" data-content="content-two">
                    <button class="btn-main">الواجبات</button>
                  </li>
                </ul>
                <div class="content-list">
                    <div class="allLessons exams content-one " data-tab-content="content-one"></div>
                    <div class="allLessons homeworks content-two none"  data-tab-content="content-two"></div>
                </div>
            </div>
       
            `)
}


function displayExams(studentExams, homeworks, isTeacher, isSame) {

    $('.lesson').remove()
    if (studentExams.length > 0) {
        studentExams.forEach(e => {
            let totalScore = 0
            let examScore = 0
            e.lessonQuestions.forEach(l => {
                totalScore += l.point
                if (l.questionScore) {

                    examScore += l.questionScore
                } else {
                    examScore += 1
                }
            })
            examItem('exam', e, totalScore, examScore, isTeacher)

        })
    } else {
        $('.allLessons.exams').append('<h3 class="p-medium">لا يوجد امتحانات الأن</h3>')
    }
    if (homeworks.length > 0) {
        homeworks.forEach(e => {
            let totalScore = 0
            let examScore = 0
            e.lessonQuestions.forEach(l => {
                totalScore += l.point
                if (l.questionScore) {

                    examScore += l.questionScore
                } else {
                    examScore += 1
                }
            })
            examItem('homework', e, totalScore, examScore, isTeacher)
        })
    } else {
        $('.allLessons.homeworks').append('<h3 class="p-medium">لا يوجد واجبات الأن</h3>')
    }
}



function examItem(type, e, totalScore, examScore, isTeacher) {

    $(`.allLessons.${type}s`).append(`
    <div class="lesson ${type}" data-section="${e.section}">
        <input type="hidden" value="${e._id}" name="lessonId" >
        <input type="hidden" value="${e.student}" name="studentId" >
        <div class="lesson-header flex f-space-between">
            ${isTeacher ? '<i class="fas fa-times  deleteLesson" id="deleteLesson"></i>' : ''}
            <p style="font-size:10px; margin-bottom:var(--scnd-margin); text-align:left;">${e.takenAt}</p>
        </div>
        <h2 class="m-b-3 p-4"> ${e.name}</h2>
        <span class="m-t-3"> مجموع النقاط: ${totalScore} / ${examScore}</span>
    </div>`)
}

function displayExam(exam, isHomework) {

    $('.sheet .all-items').empty()
    $('.questionBox').remove()

    exam.lessonQuestions.forEach(q => {
        $('#choosenLesson .all-items').append(`
        <div class="questionBox lessons-list_item">
            <input type="hidden" name="lessonId" value="${exam._id}" />
            <input type="hidden" name="questionId" value="${q._id}" />
            <div class="lessons-list_item_head">
                <div class="lesson-list_item_head_score flex f-space-between">
                    <div class="p-4 grid">
                        <span>
                        حصل علي: ${q.questionScore != undefined ? q.questionScore : 1} / <b class="points">${q.point}</b>
                        <span> ${q.questionType !== 'choose' ? q.questionType !== 'truefalse' ? '<i class="fas fa-sync font-s i-bg i-bg-large changeScore"></i>' : '' : ''} ${q.questionType != 'choose' ? ` <input type="number" min="0" max="${q.questionScore != undefined ? q.questionScore : 1}" class="questionScore none" value="${q.point}" name="questionScore" placeholder="Add Score..">` : ''}</span>
                        </span>
                    </div>
                   
               
                   </div>
            </div>
            <div class="lessons-list_item_body">
                <p class="question">${q.question}</p>
                 <div class="selectedAnswer">الاجابه:  
                        ${q.questionType === 'written' ? ` <img style="width:100%;" src="/${q.selectedAnswer.answer}">` : `<p>${q.questionType === 'truefalse' ? `${q.selectedAnswer.answer == 1 ? 'true' : q.selectedAnswer.answer == 0 ? 'false' : 'لم يتم الاجابه عنه'}` : `${q.selectedAnswer.answer}`}</p>`}
                 </div>
                 <div class="selectedAnswer">
                        ${q.questionType === 'choose' ? `الأجابه الصحيحه ${q.correctAnswer}` : q.questionType === 'truefalse' ? `الأجابه الصحيحه ${q.correctAnswer == 1 ? 'true' : 'false'}` : ""}
                 </div>
                <div class="answerBox"></div>
                <i style="position:absolute; bottom:0; left:50%;" class="fas fa-sort-down expandQ"></i>
                </div>
            </div>
        </div>
        `)
    })
}
function attendanceSheet(attendance) {
    $('.sheet .all-items').empty()
    $('.sheet.attendance .fall-back').remove()
    if (attendance.length > 0) {
        attendance.forEach(a => { $('.sheet.attendance .all-items').append(`<p class="font-l m-medium p-medium bg-darkgray grid g-three"><b>${a.number}</b><b>${a.date}</b> <b>${a.center}</b></p>`) })
    } else {
        $('.sheet.attendance .all-items').append("<h3 class='fall-back p-large'>لم يحضر حتي الأن.</h3>")
    }
    $('.sheet.attendance').removeClass('none')
}
function studentinformation(sts) {

    $('.sheet.information .all-items').empty()
    if (sts.length > 0) {
        for (let i = 0; i < sts.length; i++) {

            $('.sheet.information .all-items').append(`
                <div class=" p-medium bg-w ">
                    <div class="information-body">
                        <h6>الأسم: ${sts[i].name}</h6>
                        <h6>الموبايل: ${sts[i].mobile}</h6>
                        <h6>الفصل الدراسي: ${sts[i].classroom}</h6>
                        <h6>المجموعه: ${sts[i].center}</h6>
                    </div>
               
                </div>
            `)
            JsBarcode(`#code128-${sts[i]._id}`, sts[i]._id, {
                format: "CODE128",
                displayValue: true
            });

        }
    }

    $('.sheet.information').removeClass('none')
}