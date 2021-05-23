function teachers(teachers, teachersElm) {
    teachers.forEach(t => {
        teachersElm.append(`
            <div class="teacher">
                <h5>${t.teacherId.name}</h5>
                <span>${t.teacherId.mobile}</span>
                <span>$${t.teacherId.membership}</span>
                <input type="hidden" name="teacherId" value=${t.teacherId._id}>

                <button onclick="${t.active ? 'deactiveStudent(this)' : 'activeStudent(this)'}"  class="btn btn-${t.active ? 'danger' : 'success'}">${t.active ? ' Deactivate' : 'Activate'}</button>

            </div>
        `)

    })
}

function searchResult(student) {
    $('.student-panel_students-list').prepend(`
    <li class="list-group-item align-items-center activeStudent">
        <img class="loading loading-small" src="/images/loading(3).svg">
        <input type="hidden" name="studentId" value="${student._id}">
        <a href="/teacher/student/${student._id}"> ${student.name}</a>
        <span class="badge badge-danger badge-pill">
            <a href="/owner/deleteStudnet/${student._id}" class="deleteStudent "> <i class="fas fa-trash c-r"></i> </a>
        </span>
        <div class="teachers none">
            <i class="fas fa-times closeTeachers"></i>
            <img src="/images/loading(3).svg" class="loading loading-small" alt="">
        </div>
        <div class="flex f-space-between">
            <a onclick="getStudentTeachers(this)" class="btn btn-info">Student Teachers</a>
            <a href="/owner/resetPassword/${student._id}" class="btn  btn-info font-s">Reset Password</a>
        </div>
    </li>
    `)
}