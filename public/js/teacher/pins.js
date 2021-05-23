async function printPins() {
    const pins = window.location.search.replace('?reqpins=', '')
    if (!pins) return message('لم يتم حديد عدد الاكواد التي تريد طباعتها', 'info', 'body')
    $('#confirm_print').addClass('none')
    const data = await fetchdata('/teacher/pins/print', 'put', JSON.stringify({ pins: pins }), true)
    if (data) {
        setTimeout(() => {
            $('.all-items').empty()
            $('.go-back').removeClass('none')
        }, 5000);

        window.print()
    }
    if (!data) {
        $('#confirm_print').removeClass('none')
        $('.go-back').addClass('none')

    }
    // $('.wrapper').removeClass('loader-effect')

}



function openForm() {
    $('input[name="reqpins"]').focus()
    $('.external-box').removeClass('none')
}

function closeForm() {
    $('.external-box').addClass('none')
}
