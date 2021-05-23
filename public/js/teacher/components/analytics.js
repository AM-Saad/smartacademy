function questionmesure(questions, max, min) {
    $('.questions-report .question').remove()
    $('.questions-details').empty()
    if (questions.length > 0) {
        questions.forEach(q => {
            $('.questions-report').append(`
                <div class="question"> 
                    <p> Question: <b> ${q.question} </b> </p>
                    <p> Taken: <b> ${q.taken} Times </b> </p>
                    <p> Correct: <b> ${q.correct} Times </b> </p>
                </div>
            `)

        });

        $('.questions-details').append(`
            <div class="p-3 bg-w m-3">
                <div class="flex">
                    <h4>Most correct answer</h4>
                    <i class="far fa-check-circle c-g m-l-3"></i>
                </div>
                <p>${max.question.slice(0, 28)}</p>
            </div>
            <div class="p-3 bg-w m-3">
                <div class="flex">
                    <h4>Least correct answer</h4>
                    <i class="far fa-times-circle c-r m-l-3"></i>
                </div>
                <p>${min.question.slice(0, 28)}</p>
            </div>
        `)
    }

}