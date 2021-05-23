

const btn = document.getElementById('searchStudentBtn')
document.querySelector('#searchStudent').addEventListener('keypress', function (e) { if (e.key === 'Enter') searchstudent(btn) });
const searchstudent = async (btn) => {

    $('.activeStudent').fadeOut(300).remove()
    const studentnumber = btn.parentNode.querySelector('[name=number]').value;
    $('.searchResult .alert').remove()
    $('#students-panel').addClass('loader-effect')
    const data = await fetchdata(`/owner/studentByNumber/${studentnumber}`, 'get', {}, true)
    if (data) {
        searchResult(data.json.student)
    }
    return $('#students-panel').removeClass('loader-effect')

}

const getStudentTeachers = async (btn) => {
    const teachersElm = $(btn).parents('.list-group-item').find('.teachers')
    if (teachersElm.find('.teacher').length === 0) {
        teachersElm.addClass('external-box')
        teachersElm.removeClass('none')
        teachersElm.addClass('loader-effect')
        const studentId = $(btn).parents('.list-group-item').find('[name=studentId]').val();
        const data = await fetchdata(`/owner/studentTeachers/${studentId}`, 'get', {}, true)
        $(btn).parents('.list-group-item').find('.loading').css({ display: 'none' })
        if (data != null) {
            teachers(data.json.student.teachers, teachersElm)
            teachersElm.removeClass('loader-effect')

        }
    } else {
        teachersElm.addClass('external-box')
        teachersElm.removeClass('none')
    }

}
$('body').on('click', '.closeTeachers', function (e) {
    $(e.target).parent('.teachers').addClass('none').removeClass('external-box')
})
const activeStudent = async (btn) => {

    const studentId = $(btn).parents('.list-group-item').find('[name=studentId]').val();
    const teacherId = $(btn).parent('.teacher').find('[name=teacherId]').val();
    $('.teachers').addClass('loader-effect')
    const data = await fetchdata(`/owner/activateStudent/${studentId}?teacherId=${teacherId}`, 'put', {}, false)
    if (data != null) {
        $(btn).parent('.teacher').append(`<button onclick="deactiveStudent(this)" class="btn btn-danger">Dectivate</button> `)
        $(btn).fadeOut(200).remove()

    }
    $('.teachers').removeClass('loader-effect')

}
const deactiveStudent = async (btn) => {

    $('.teachers').addClass('loader-effect')
    const studentId = $(btn).parents('.list-group-item').find('[name=studentId]').val();
    const teacherId = $(btn).parent('.teacher').find('[name=teacherId]').val();
    const data = await fetchdata(`/owner/deactivateStudent/${studentId}?teacherId=${teacherId}`, 'put', {}, false)
    if (data != null) {
        $(btn).parent('.teacher').append(`
            <button onclick="activeStudent(this)" class="btn btn-success">Activate</button>
            
            `)
        $(btn).fadeOut(200).remove()
    }
    $('.teachers').removeClass('loader-effect')


}
const deactivateAllStudent = async (e) => {

    if (confirm("Do you want to De-activate all student?")) {
        $('#students-panel').addClass('loader-effect')
        const data = await fetchdata(`/owner/deactivateAllStudents`, 'put', {}, false)
        if (data != null) {
            message('De-Activated', 'info', 'body')
            setTimeout(() => { location.reload() }, 1000);
        } else {
            $('#students-panel').removeClass('loader-effect')


        }

    } else {
        e.preventDefault()
    }

}
const activateAllStudent = async (e) => {

    if (confirm("Do you want to Activate all student?")) {
        $('#students-panel').addClass('loader-effect')
        const data = await fetchdata(`/owner/activateAllStudents`, 'put', {}, false)
        if (data != null) {
            message('Activated', 'success', 'body')
            setTimeout(() => { location.reload() }, 1000);
        } else {
            $('#students-panel').removeClass('loader-effect')
        }
    } else {
        e.preventDefault()
    }
}
$('.deleteStudent').on('click', function (e) {
    if (confirm("Do you want to delete this?")) {
    } else {
        e.preventDefault()
    }
})
