
/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/

(function () {
    const attendance = {
        fetchedStudents: [],
        lectures: [],
        students: [],
        searchdate: { start: moment().format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') },
        socket: null,
        init: function () {
            // $('#buzzer').get(0).play()
            // $('#gift-close').trigger('click')
            this.cashDom()

            this.getPicker()
            const from = [moment().format('YYYY-MM-DD')]
            const to = [moment().format('YYYY-MM-DD')]
            // attendance.attendanceByDate(from, to)
            this.bindEvents()
            // attendance.socket = io.connect('/sales')
            // attendance.socket.emit('getsales', attendance.companyId)
            // attendance.socket.on('success', (data) => {
            // console.log(data);
            // });
            // attendance.socket.on('newsales', (data) => {
            // this.appenedSinglSales(data.newSales)
            // });

        },
        cashDom: function () {
            this.$center = $('input[name="center"]')
            this.$classroom = $('input[name="classroom"]')

            this.$opennewSession = $('.new-session')
            this.$create = $('.create-session')

            this.$search = $('.search-attendance')
            this.$scan = $('.start-scan')
            this.$stopScan = $('.stop-scan')
        },
        bindEvents: function () {
            // document.addEventListener('keypress', this.checkKey.bind(this), true)
            this.$center.on('click', this.selectCenter.bind(this))
            this.$classroom.on('click', this.selectclassroom.bind(this))

            this.$opennewSession.on('click', this.openNewSession.bind(this))
            this.$create.on('click', this.createSession.bind(this))

            this.$search.on('click', this.searchattendance.bind(this))
            $('body').on('click', '.edit-session', this.editSession.bind(this))
            this.$scan.on('click', this.startScan.bind(this))
            this.$stopScan.on('click', this.stopScan.bind(this))
            $('body').on('click', '.go-back', this.goBack.bind(this))

        },
        getPicker: function (e) {
            const start = moment()
            const end = moment()
            function cb(start, end) {
                $('#reportrange span').html(start.format('MMMM D, YYYY') + " - " + end.format('MMMM D, YYYY'));
                $('.sorting h4').html(start.format('MMMM D, YYYY') + " - " + end.format('MMMM D, YYYY'));
            }
            cb(start, end);
            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
                // attendance.attendanceByDate(picker.startDate.format('YYYY-MM-DD'), picker.endDate.format('YYYY-MM-DD'))
                cb(picker.startDate, picker.endDate);
                attendance.searchdate = { start: picker.startDate.format('YYYY-MM-DD'), end: picker.endDate.format('YYYY-MM-DD') }
            });
        },
        selectCenter: (e) => {
            $(e.target).prop("checked", true);
            const parentDiv = $(e.target).parents('fieldset.centers')
            $(parentDiv).find('input[type="checkbox"]').not($(e.target)).prop("checked", false)
            // $('body').find('input[type="radio"]').not($(e.target)).prop("checked", false)
        },
        selectclassroom: (e) => {
            $(e.target).prop("checked", true);
            const parentDiv = $(e.target).parents('fieldset.classrooms')
            $(parentDiv).find('input[type="checkbox"]').not($(e.target)).prop("checked", false)
        },
        searchattendance: async (e) => {
            const classroom = $("input[name='classroom']:checked").val()
            const center = $("input[name='center']:checked").val()
            // const number = $("#searchNo").val()
            if (!classroom || !center) return message('select classroom and center', 'info', 'body')
            // if (!number) return message('Choose session number', 'info', 'body')
            $('.content').addClass('loader-effect')
            const data = await fetchdata('/public/sessions', 'put', JSON.stringify({ classroom: classroom, center: center, number: number }), true)
            if (data != null) {
                this.lectures = data.json.lectures
                this.students = data.json.students
                console.log(this.students);

                attendanceSheet(data.json.lectures, data.json.students, false)
                attendance.makeFilterations(data.json.lectures, data.json.students)
                attendance.detectScanner()
            }
            $('.content').removeClass('loader-effect')
        },
        startScan: (e) => {
            console.log('e');
            // scanSheet(classroom, center, number, id)
        },
        editSession: (e) => {
            const sessionNo = $(e.target).data('session')
            if (sessionNo) {
                const session = this.lectures.filter(l => l.number === sessionNo)
                attendanceSheet(session, this.students, true)
            }
        },
        stopScan: () => {
            $('.attendance-sheet .user').remove()
            $('.attendance-sheet').removeClass('scale')
        },
        confirmAttendance: async (studentId) => {
            const sessionNo = $('#number').val()
            const classroom = $('#classroom').val()
            const center = $('#center').val()
            console.log(sessionNo);
            console.log(classroom);
            console.log(center);
            if (attendance.isEmptyOrSpaces(sessionNo) || attendance.isEmptyOrSpaces(classroom) || attendance.isEmptyOrSpaces(center)) { return message('Make sure to select session you want to scan and try again', "info", 'body') }
            $('.inside-wrapper').addClass('loader-effect')
            const data = await fetchdata(`/public/attendance/${studentId}`, 'post', JSON.stringify({ date: moment().format('YYYY-MM-DD'), number: sessionNo, classroom: classroom, center: center }), true)
            if (data) {

                const elm = $(`.dates-date[data-sid="${data.json.student._id.toString()}"][data-sessionno="${sessionNo}"]`)
                elm.html(`<i class="far fa-check-circle c-g m-r-3" aria-hidden="true"></i>${moment().format('YYYY-MM-DD')}`)
                message('Confirmed', 'info', 'body')
            }
            $('.inside-wrapper').removeClass('loader-effect')

        },
        // checkKey: function (e) {
        //     const uniKey = e.which
        //     const char = String.fromCharCode(e.which)

        //     console.log(e.which);
        //     switch (uniKey) {
        //         case 45:
        //             attendance.salesState = 'canceled'
        //             attendance.showMessage('يتم الغاء الطلبات القادمه', 'error', '#salesInterface')
        //             break;
        //         case 43:
        //             attendance.salesState = 'delivered'
        //             attendance.showMessage('يتم اتمام الطلبات القادمه', 'info', '#salesInterface')
        //             break;
        //         case 42:
        //             attendance.salesState = 'waiting'
        //             attendance.showMessage('يتم تعليق الطلبات القادمه', 'info', '#salesInterface')
        //             break;
        //         case 47:
        //             attendance.salesState = 'get'
        //             attendance.showMessage('يتم احضار الطلبات القادمة', 'info', '#salesInterface')
        //             break;
        //         default:
        //             console.log('');

        //     }
        //     console.log(attendance.salesState);
        // },

        detectScanner: function () {
            $(window).scannerDetection()
            $(window).bind('scannerDetectionComplete', function (e, data) {
                if (!data.string) return message('Scan Again', 'info', 'body')
                attendance.confirmAttendance(data.string)

            }).bind('scannerDetectionError', function (e, data) {
                console.log('error');
            }).bind('scannerDetectionReceive', function (e, data) {
                console.log('');
            })
        },

        startPrinting: function (e) {
            Popup($('.invoice')[0].outerHTML);
            function Popup(data) {
                window.print();
                return true;
            }
        },
        openNewSession: (e) => {
            $('.startSession').toggleClass('none')
        },
        createSession: async (e) => {
            e.preventDefault()
            const classroom = $("input[name='sessionclassroom']:checked").val()
            const center = $("input[name='sessionCenter']:checked").val()
            const sessionnumber = $("input[name='sessionNo']").val()
            if (!classroom || !center || !sessionnumber) return message('select classroom, center and number', 'info', 'body')
            $('.inside-wrapper').addClass('loader-effect')
            const data = await fetchdata(`/public/sessions`, 'post', JSON.stringify({ date: moment().format('YYYY-MM-DD'), classroom: classroom, center: center, number: sessionnumber }), true)
            if (data) {
                attendanceSheet(data.json.lectures, data.json.students, true)
                attendance.openNewSession()
                attendance.detectScanner()
            }
            return $('.inside-wrapper').removeClass('loader-effect')
        },

        makeFilterations: function (lectures, students) {
            // const maped = students.map(s => ({
            //     student: { _id: s._id, name: s.name, classroom: s.classroom, center: s.center },
            //     attendance: lectures.map(l => {
            //         const exist = l.students.find(st => st.id.toString() === s._id.toString())
            //         if(exist){

            //         }
            //     })
            // }))

            // i have all requested sessions
            /// i have all students should be attend this sessions
            //each session has student attended only
            // i need to show all students and all sessions and with each session i have to display if student attend or no with the date if attended

            // const allLec = {}

            // const maped = lectures.map(l => ({
            //     lecture: { number: l.number, date: l.date },
            //     students: students
            // }))
            // students.forEach(s => {
            //     maped.students.find(st => {  })
            // });
            // console.log(maped);

            // scanSheet(lectures, maped)

        },
        isEmptyOrSpaces: (str) => str === null || str.match(/^ *$/) !== null,

        goBack: (e) => {
            attendanceSheet(this.lectures, this.students, false)
        }


    }

    attendance.init()
})()

