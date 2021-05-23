
function attendanceSheet(lectures, students, edit) {
    $('.content .dates').empty()
    $('.content .students').empty()
    $('.body .attendance').empty()
    $('.attendance-sheet .user').remove()
    $('.inside-wrapper .go-back').remove()
    $('.attendance-sheet').addClass('scale')
    $('.stop-scan').removeClass('none')

    $('#center').val(null)
    $('#classroom').val(null)
    $('#number').val(null)
    students.forEach(s => {
        $('.content .students').append(`
            <div class="flex">
                <input type="hidden" name="id" value="${s._id}">
                <span>${s.name}</span>
            <div>`)
        $('.body .attendance').append(`
            <div class="flex studentAttend">
                <input type="hidden" name="id" value="${s._id}">
            <div>`)
    })

    lectures.forEach(l => {
        $('.content .dates').append(`<div data-session=${l.number} class="dates-date edit-session">Session No:${l.number}</div>`)
        l.students.forEach(s => { $('.body .attendance').find(`input[value="${s.id}"]`).parent('.studentAttend').append(`<div class="dates-date" data-sid=${s.id} data-sessionno=${l.number}> ${s.attended ? `<i class="far fa-check-circle c-g"></i> ${s.date} ` : '<i class="far fa-times-circle c-r"></i>'}</div> `) })
    });
    $('h3.title').html(`All Session for <b>classroom: ${lectures[0].classroom}</b> & <b>Center: ${lectures[0].center}</b>`)

    if (edit) {
        $('.stop-scan').addClass('none')
        $('.inside-wrapper').append('<i class="close go-back fas fa-arrow-left"></i>')
        $('h3.title').html(`Session Number ${lectures[0].number} <br> <p class="font-s"><b>classroom: ${lectures[0].classroom}</b> & <b>Center: ${lectures[0].center}</b></p>`)
        $('#center').val(lectures[0].center)
        $('#classroom').val(lectures[0].classroom)
        $('#number').val(lectures[0].number)
    }
}


