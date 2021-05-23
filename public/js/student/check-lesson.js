
$('.openExam').on('click', checkExamStatus)

async function checkExamStatus(e) {
    
    const lessonId = $(e.target).parents('.card').find('input[name="lessonId"]').val()
    console.log(lessonId);
    
    if ($(e.target).parents('.card').find('.lesson-pin').length > 0) {
        e.preventDefault()
        $(e.target).parents('.card').addClass('loader-effect')
        let pin = $(e.target).parents('.card').find('input[name="studentpin"]').val()

        const data = await fetchdata(`/lesson/${lessonId}/check`, 'post', JSON.stringify({ pin: pin }), true)
        if (data != null) {
            return window.location.href = `/lesson/${lessonId}`
        }
        $(e.target).parents('.card').removeClass('loader-effect')


    }

}