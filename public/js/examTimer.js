

/*jslint browser: true*/

/*global console, alert, $, jQuery*/

const url = "http://localhost:3000";

(function () {
    const examTiming = {


        init: function () {
            this.cashElements()
            this.setStartTime()
        },
        cashElements: function () {
            this.examForm = document.getElementById('exam')
            this.examId = document.querySelector('input[name="examId"]').value
            this.currentTime = new Date();
            this.examStartTime = this.currentTime;
            this.examEndTime = null
        },
        setStartTime: function () {
            const exsistTime = JSON.parse(localStorage.getItem('examTiming'))
            if (exsistTime) {
                if (this.examId.toString() === exsistTime.examId.toString()) {
                    this.checkTime()
                } else {
                    window.location.href = `${url}/startExam/${exsistTime.examId}`;
                    alert("There'is unfinished exam MUST to finish first you be reditected ")
                }

            } else {
                const examTiming = {
                    examId: this.examId,
                    examStartDay: this.currentTime.getDate(),
                    examStartHr: this.currentTime.getHours(),
                    examStartMin: this.currentTime.getMinutes()
                }
                localStorage.setItem("examTiming", JSON.stringify(examTiming));
                this.setEndTime()
            }
        },
        setEndTime: function () {
            const examTiming = JSON.parse(localStorage.getItem('examTiming'))
            const endTime = {
                examId: this.examId,
                examEndDay: examTiming.examStartDay,
                examEndHr: (examTiming.examStartHr + 1),
                examEndMin: examTiming.examStartMin
            }
            localStorage.setItem("endTime", JSON.stringify(endTime));
            this.checkTime()
        },
        checkTime: function () {

            console.log(this.currentTime);
            const endTime = JSON.parse(localStorage.getItem('endTime'))
            console.log(endTime);

            if (this.currentTime.getHours() >= endTime.examEndHr && this.currentTime.getMinutes() >= endTime.examEndMin) {
                this.examForm.submit()
                localStorage.removeItem('endTime')
                localStorage.removeItem('examTiming')
            }

        }


    }
    examTiming.init()
})()


// $(function () {
//     function confirmclose() {
//         return "Are you sure? you want to close";
//     }
//     window.onbeforeunload = confirmclose;
// });

// function startExamTimer() {





//     var examStartTime = currentTime

//     localStorage.setItem("examStartTimer", examStartTime);

//     const examEndTime = currentTime.setSeconds(currentTime.getSeconds() + 3)

//     localStorage.setItem("examEndTimer", currentTime);


//     const examEnd = localStorage.getItem('examEndTimer')
//     // if (examEnd == new Date()) {
//     //     console.log('finished');

//     // }
//     window.setInterval(function () {
//         if (examEnd == new Date()) {
//             // $('#exam').submit()

//         }

//     }, 1000);


// }

// startExamTimer()

