
let teacherclasses = []
$('input[name="class"]').on('click', function (e) {
    let state = $(e.target).prop('checked')
    let en = $(e.target).val()
    let ar = $(e.target).data('ar')
    if (state) {
        teacherclasses.push({ en: en, ar: ar })
    } else {
        teacherclasses = teacherclasses.filter(c => c.en !== en)
    }
    console.log(teacherclasses);

})

function openClasses() {
    $('.classes_box').toggleClass('none')
}

async function registerTeacher(e) {

    e.preventDefault()
    const name = document.getElementById('teachername').value
    const mobile = document.getElementById('teachermobile').value
    const password = document.getElementById('teacherpassword').value
    const confirmpassword = document.getElementById('teacherconfirmpassword').value
    const subject = document.getElementById('teachersubject').value
    if (teacherclasses.length == 0) return message('برجاء اختيار صف واحد علي الاقل', 'info', 'body')
    if (!name || !mobile || !password || !subject) return message('برجاء ملئ جميع الحقول', 'info', 'body')
    if (password !== confirmpassword) return message('الرقم السري غير متطابق', 'info', 'body')
    $('.auth form').addClass('loader-effect')

    const data = await fetchdata('/signup?t=teacher', 'post', JSON.stringify({ name, mobile, password, confirmpassword, subject, teacherclasses }), true)
    if (data) {
        window.location.href = '/login'
    }
    $('.auth form').removeClass('loader-effect')

}


async function registerStudent(e) {
    e.preventDefault()
    const name = document.getElementById('name').value
    const mobile = document.getElementById('mobile').value
    const password = document.getElementById('Password').value
    const confirmpassword = document.getElementById('confirmpassword').value
    const classroom = document.getElementById('classroom').value
    const governorate = document.getElementById('governorate').value
    const school = document.getElementById('school').value
    if (!name || !mobile || !password || !school || !governorate) return message('برجاء ملئ جميع الحقول', 'info', 'body')

    $('.auth form').addClass('loader-effect')

    const data = await fetchdata('/signup?t=student', 'post', JSON.stringify({ school, governorate, name, mobile, password, confirmpassword, classroom }), true)
    if (data) {
        window.location.href = '/subjects'
    }
    $('.auth form').removeClass('loader-effect')

}