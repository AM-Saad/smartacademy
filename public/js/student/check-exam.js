
$('.openexam').on('click', checkExamStatus)

async function checkExamStatus(e) {
    e.preventDefault()
    const examId = $(e.target).parents('.card').find('input[name="examId"]').val()
    const examType = $(e.target).parents('.card').find('input[name="examType"]').val()
    const lessonId = $('input[name="lessonId"]').val()
    let pin;
    if ($(e.target).parents('.card').find('input[name="pin"]').length > 0) {
        pin = $(e.target).parents('.card').find('input[name="pin"]').val()
        if (pin.length < 4) {
            return message('Add Correct Pin To Start', 'info', 'body')
        }
    }
    $(e.target).parents('.card').addClass('loader-effect')
    const data = await fetchdata(`/exam/${examId}/check?examType=${examType}`, 'post', JSON.stringify({ pin: pin }), true)
    if (data != null) {
        return window.location.href = `/exam/${examId}?lessonId=${lessonId}&&examType=${examType}`
    }
    $(e.target).parents('.card').removeClass('loader-effect')





}