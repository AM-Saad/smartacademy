
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
        $('.allLessons.exams').append('<h3 class="p-medium">No Exam Yet..</h3>')
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
        $('.allLessons.homeworks').append('<h3 class="p-medium">No Homeworks Yet..</h3>')
    }
}


function examItem(type, e, totalScore, examScore, isTeacher) {
    console.log(e);

    $(`.allLessons.${type}s`).append(`
    <div class="lesson ${type}" data-section="${e.section}">
        <input type="hidden" value="${e._id}" name="lessonId" >
        <input type="hidden" value="${e.student}" name="studentId" >
        <div class="lesson-header">
            <p style="font-size:10px; margin-bottom:var(--scnd-margin); text-align:left;">${e.takenAt}</p>
            ${isTeacher ? type === 'homework' ? '<i class="fas fa-times  delete-homework" id="deleteLesson"></i>' : '<i class="fas fa-times  deleteLesson" id="deleteLesson"></i>' : ''}
        </div>
        <h2 class="m-b-3 p-4"> ${e.name}</h2>
        <span class="badge badge-success badge-pill"> Total Score: ${totalScore} / ${examScore}</span>
    </div>`)
}

function displayExam(exam, isHomework) {


    exam.lessonQuestions.forEach(q => {
        $('#choosenLesson .all-items').append(`
        <div class="questionBox lessons-list_item">
            <input type="hidden" name="lessonId" value="${exam._id}" />
            <input type="hidden" name="questionId" value="${q._id}" />
            <div class="lessons-list_item_head">
                <div class="lesson-list_item_head_score flex f-space-between">
                    <div class="p-4 grid">
                        <span>Question Score: ${q.questionScore != undefined ? q.questionScore : 1}</span>
                        <span class="points">Points:<b>${q.point}</b> ${q.questionType !== 'choose' ? q.questionType !== 'truefalse' ? '<i class="fas fa-sync font-s i-bg i-bg-large changeScore"></i>' : '' : ''}</span>
                    </div>
                   ${q.questionType != 'choose' ? ` <input type="number" min="0" max="${q.questionScore != undefined ? q.questionScore : 1}" class="${isHomework ? 'homeworkquestionScore' : 'questionScore'} none" value="${q.point}" name="${isHomework ? 'homeworkquestionScore' : 'questionScore'}" placeholder="Add Score..">` : ''}
                </div>
            </div>
            <div class="lessons-list_item_body">
                <p class="question">${q.question}</p>
                 <div class="selectedAnswer">Answer:  
                        ${q.questionType === 'written' ? ` <img style="width:100%;" src="/${q.selectedAnswer.answer}">` : `<p>${q.questionType === 'truefalse' ? `${q.selectedAnswer.answer == 1 ? 'true' : q.selectedAnswer.answer == 0 ? 'false' : 'Not Answered'}` : `${q.selectedAnswer.answer}`}</p>`}
                 </div>
                 <div class="selectedAnswer">
                        ${q.questionType === 'choose' ? `Correct Answer: ${q.correctAnswer}` : q.questionType === 'truefalse' ? `Correct Answer: ${q.correctAnswer == 1 ? 'true' : 'false'}` : ""}
                 </div>
                <div class="answerBox" data-id=${q._id}></div>
                <i style="position:absolute; bottom:0; left:50%;" class="fas fa-sort-down expandQ"></i>
                </div>
            </div>
        </div>
        `)
        let answersBox = $(`[data-id=${q._id}]`)
        if (q.questionImg !== '' || q.questionImg !== undefined) {
            answersBox.append(` <img src="/${q.questionImg}" > `)
        }
        q.answers.forEach(a => {
            if (a.answerNo > 0) {
                const answ = document.createElement('p')
                answ.setAttribute('class', 'answer')
                answ.innerHTML = `${a.answer} `
                answersBox.append(answ)
            }
        })
    })
}