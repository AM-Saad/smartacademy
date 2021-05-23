async function printPins() {
    const pins = window.location.search.replace('?reqpins=', '')
    if (!pins) return message('Write how many pins you want to print', 'info', 'body')
    const data = await fetchdata('/admin/pins/print', 'put', JSON.stringify({ pins: pins }), true)
    if (data) {
        window.print()

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
