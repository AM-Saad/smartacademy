/*jslint browser: true*/

/*global console, alert, $, jQuery*/
const editForms = (function () {
    // cash DOM
    let $editBtn = $('.editForm')

    //Add Event
    $('body').on('click', '.editForm', editform)

    //edit Functions
    function editform(e) {

        let form = $(e.target).parents('form')

        $(form).find('input').removeAttr('disabled')
        $(form).find('.invisible').addClass('none')
        $(form).find('.visible').removeClass('none')
        // $(form).find('.editForm').addClass('none')
        $(form).find('.item-actions').addClass('none')
        $(form).find('.tumbnialImage').removeClass('none')
        $(form).find('.updatedBtn').removeClass('none')
        $(form).find('.cancelBtn').removeClass('none')
        $(form).find('.cancelBtn').on('click', function () {
            $(form).find('input').attr('disabled', true)
            $(form).find('.item-actions').removeClass('none')
            $(form).find('.updatedBtn').addClass('none')
            $(form).find('.cancelBtn').addClass('none')
            $(form).find('.tumbnialImage').addClass('none')
            $('.thum-img').addClass('none').attr('src', '')
            $(form).find('.visible').addClass('none')
            $(form).find('.invisible').removeClass('none')

        })
    }
 
    return {
        editform: editform
    }
})()