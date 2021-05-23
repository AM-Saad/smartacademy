// /*jslint browser: true*/
// /*global console, alert, $, jQuery*/

// (function () {
//     const notifications = {
//         allNotifications: [],
//         init: function () {
//             this.cashDom()
//             this.bindEvents()
//             this.getNotification()
//         },
//         cashDom: function () {
//             this.$getNotfiBtn = $('#NotfiBtn')
//             this.studentId = $('input[name="studentIdNotifi"]').val();
//         },
//         bindEvents: function () {
//             this.$getNotfiBtn.on('click', this.markedSeenNotification.bind(this))
//         },
//         getNotification: function (e) {
//             $('#loading').css({ display: 'block' })
//             // $('#notifications').css({ visibility: 'visible' })
//             fetch(`/getNotification/${this.studentId}`).then(res => {
//                 if (res.status === 200) {
//                     return res.json()
//                 }
//             }).then(resData => {
//                 this.allNotifications = resData
//                 const filterNotify = this.allNotifications.filter(n => {
//                     console.log(n.seen);

//                     return n.seen === false
//                 })

//                 if (filterNotify.length > 0) {
//                     $('#NotfiBtn').find('i').addClass('activeNotification')
//                     $('#NotfiBtn').find('i').html(`<p id="notifiLength">${filterNotify.length}</p>`)
//                 }
//                 $('#loading').css({ display: 'none' })


//             }).catch(err => {
//                 console.log(err);
//             })
//         },
//         markedSeenNotification: function (e) {
//             e.stopPropagation()
//             $('.notification').remove()
//             if ($('#notifications').css('visibility') != 'visible') {
//                 $('#loading').css({ display: 'block' })
//                 $('#notifications').css({ visibility: 'visible' })
//                 let filterNotify = []
//                 this.allNotifications.forEach(n => {
//                     if (n.seen === false) {
//                         console.log(n);

//                         filterNotify.push(n)
//                         return n.seen = true
//                     }
//                 })

//                 // const filterNotify = this.allNotifications.filter(n => {
//                 //     console.log(n.seen);

//                 //     return n.seen === false
//                 // })
//                 console.log(filterNotify);

//                 if (filterNotify.length > 0) {

//                     fetch(`/markNotification/${notifications.studentId}`, {
//                         method: 'Post',
//                         headers: {
//                             'Accept': 'application/json',
//                             'Content-Type': 'application/json'
//                         },
//                     }).then(res => {
//                         $('#NotfiBtn').find('i').removeClass('activeNotification')
//                         $('#notifiLength').remove()
//                         $('#loading').css({ display: 'none' })
//                         return this.renderNotifications(this.allNotifications)

//                     }).catch(err => {
//                         console.log(err);
//                     })
//                 } else {
//                     $('#loading').css({ display: 'none' })

//                     return this.renderNotifications(this.allNotifications)
//                 }
//             } else {
//                 return $('#notifications').css({ visibility: 'hidden' })

//             }

//         },
//         renderNotifications: function (notifications) {
//             notifications.forEach(n => {
//                 $('#notifications').append(`
//                     <div class='notification'>
//                     <img src="/${n.notifyFromImg}" class="notification-img" alt="img">
//                     <p>${n.content}</p>
//                     </div>
//                 `)
//             });
//         }
//     }
//     notifications.init()
// })()
