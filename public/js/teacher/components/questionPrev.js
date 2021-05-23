function questionPerview(questionType) {

    if (!$('#question-perview').length > 0) {
        $('#NewQuestionForm').append(`
        <div class="question-perview" style="opacity:0" id="question-perview">
        <div class="question-perview_head">
            <h4 style=" opacity: .7; font-size: 18px;">Question Perview<h4>
            <div>
                <p>Correct Answer:</p><span></span>
            </div>
        </div>
        <p id="questionText"></p>
        <p class="answerPrev" id="answerone" data-number="1"></p>
        <p class="answerPrev" id="answertwo" data-number="2"></p>
        <p class="answerPrev" id="answerthree" data-number="3"></p>
        <p class="answerPrev" id="answerfour" data-number="4"></p>
        <p class="answerPrev" id="correctanswer"></p>
        <div class="question_preview_image p-relative none">
            <i class="fas fa-trash c-r close remove-img"></i>
            <img src="" >
        </div>
      </div>
        `)

        $('.question-perview').animate({ opacity: 1 }, 1000)
    }
}