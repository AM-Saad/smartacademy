function displayquestions(allQuestions) {
    $('.question-list').remove()
    allQuestions.forEach((q, i) => {
        console.log(q.questionType);

        $('.card-body').append(`
        <ul class="question-list">
        <li class="question-list_item">
            <p style="float: left;
            margin-right: var(--scnd-margin);
            font-weight: bold;">
            ${i + 1}- 
            </p>
            <div class="p-relative">
            <p>${q.question}</p>
            ${ q.questionType == 'truefalse' ? `<span data-type="${q.questionType}">Answer: ${q.correctAnswer === 1 ? 'True' : 'False'}` : ''}
            ${ q.questionType == 'choose' ? `<span>Correct Answer: ${q.correctAnswer}</span>` : ''}
            ${ q.questionType == 'paragraph' ? `<span>Score : ${q.questionScore}</span >` : ''}
            ${ q.questionType == 'written' ? `<span>Score : ${q.questionScore}</span >` : ''}
            
            </div >
        <i class="fas fa-ellipsis-v question-sub-menu-btn"></i>
        <ul class="question-list_item-sub-list">

            <input type="hidden" name="questionId" value="${q._id}" />
            <li class="edit-question question-list_item-sub-list-action">
                <a>Edit</a>
            </li>
            <li class="delete-question question-list_item-sub-list-action">
                <a class="">Delete</a>
            </li>
        </ul>
        <div class="answerBox collapsible">

        </div>
        <input type="hidden" name="questionId" value="${ q._id}" />
        <i style="position:absolute; bottom:0; left:50%;" class="fas fa-sort-down expandQ"></i>
        </li >
        </ul >

        `)
    })
}

function displayinformation(info) {
    console.log(info);
    $('.header-info').append(`
        <h4> Questions: ${ info.allQuestions.length}</h4>
    <h4> Pin: ${info.pin || 'Opened'}</h4>
    <h4>Timer: ${info.timer || ' No '} Mins </h4>
    `)
    $('.header-title ').html(`Timer: ${info.timer || ' No '} Mins`)
    $('.header-subtitle').html(`Pin: ${info.pin || 'Opened'}`)

    $('input[name="min"]').val(`${info.timer || ''}`)
    $('input[name="pin"]').val(`${info.pin || ''}`)
}


function displayhomeworkinformation(info){
    $('.header-info').append(`
      <h4> Name: ${ info.name ? info.name : ''}</h4>
      <h4> Questions: ${ info.allQuestions.length}</h4>
      `)
  
      $('input[name="name"]').val(`${info.name ? info.name : ''}`)
  }