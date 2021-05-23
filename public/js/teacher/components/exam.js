function displayquestions(allQuestions) {
    $('.question-list').remove()
    allQuestions.forEach((q, i) => {

        $('.card-body').append(`
        <ul class="question-list">
        <li class="question-list_item">
            <p style="float: right;
            margin-right: var(--s-margin);
            font-weight: bold;">
            ${i + 1}- 
            </p>
            <div class="p-relative" >
                <p>${q.question}</p>
                <div style="margin-right: var(--s-margin);margin-top: var(--s-margin);">
                    ${ q.questionType == 'truefalse' ? `<span data-type="${q.questionType}">الأجابه الصحيحه: ${q.correctAnswer === 1 ? 'صح' : 'خطأ'}` : ''}
                    ${ q.questionType == 'choose' ? `<span>الأجابه الصحيحيه: ${q.correctAnswer}</span>` : ''}
                    ${ q.questionType == 'paragraph' ? `<span>نقاط السؤال: ${q.questionScore}</span >` : ''}
                    ${ q.questionType == 'written' ? `<span>نقاط السؤال: ${q.questionScore}</span >` : ''}
                </div>
            
            </div>
        <i class="fas fa-ellipsis-v question-sub-menu-btn"></i>
        <ul class="question-list_item-sub-list">

            <input type="hidden" name="questionId" value="${q._id}" />
            <li class="edit-question question-list_item-sub-list-action">
                <a>تعديل</a>
            </li>
            <li class="delete-question question-list_item-sub-list-action">
                <a class="">حذف</a>
            </li>
        </ul>
        <div class="answerBox collapsible" data-id=${q._id}>
            <input type="hidden" name="questionId" value="${ q._id}" />

        </div>
        <input type="hidden" name="questionId" value="${ q._id}" />
        <i style="position:absolute; bottom:0; left:50%;" class="fas fa-sort-down expandQ"></i>
        </li >
        </ul >

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

function displayinformation(info) {
    $('.header-info').append(`
        <h4> عدد الاسأله: ${ info.allQuestions.length}</h4>
        <h4> اسم الامتحان: ${info.name || 'غير مسمي'}</h4>
        <h4>الوقت ${info.timer || ' غير محدد ال '} دقائق </h4>
    `)
    $('.header-title ').html(`Timer: ${info.timer || ' No '} Mins`)
    // $('.header-subtitle').html(`Pin: ${info.pin || 'Opened'}`)

    $('input[name="name"]').val(`${info.name || ''}`)
    $('input[name="min"]').val(`${info.timer || ''}`)
    // $('input[name="pin"]').val(`${info.pin || ''}`)
}


