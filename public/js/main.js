/*jslint browser: true*/

/*global console, alert, $, jQuery*/


//show search input from admin


// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('../sw.js').then(() => {
//     console.log('Registered');
//   })
// }
// var _beforeInstallPrompt;

// if ("onbeforeinstallprompt" in window) {
//   self.addEventListener("beforeinstallprompt", function beforeInstallPrompt(evt) {
//     document.getElementById('setup_button').style.display = 'inline';
//     evt.preventDefault();
//     console.log(evt);
//     _beforeInstallPrompt = evt;

//   })

// } else {
//   alert('not has the event')
// }





function installApp() {
  _beforeInstallPrompt.prompt()
    .then(function (evt) {

      // Wait for the user to respond to the prompt
      return _beforeInstallPrompt.userChoice;

    })
    .then(function (choiceResult) {
      if (choiceResult === 'accepted') {
        document.getElementById('setup_button').style.display = 'none'
      }
    })
    .catch(function (err) {

      if (err.message.indexOf("user gesture") > -1) {
        alert('user gesture');

      } else if (err.message.indexOf("The app is already installed") > -1) {
        alert('The app is already installed');

      } else {
        alert(err)
        return err;
      }

    });
}
$(document).ready(function () {
  'use strict';

  $('.menu-link').on('click', function () {
    if (!$('.main-nav').hasClass('active')) {
      const height = $('.main-menu').height()
      $('body').css({ paddingTop: height + 30 + 'px' })
    } else {
      $('body').css({ paddingTop: '55px' })
    }
  })

  var container = $('.img-input-container'),
    inputFile = $('#file'),
    img,
    btn,
    txt = 'Change',
    txtAfter = 'Choose another pic';

  if (!container.find('#upload').length) {
    container.find('.input').append('<input data-second-color data-font-color type="button" value="' + txt + '" id="upload">');
    btn = $('#upload');
    img = $('#uploadImg');
  }


  btn.on('click', function () {
    // img.animate({ opacity: 0 }, 300);
    inputFile.click();
  });

  inputFile.on('change', function (e) {
    container.find('label').html(inputFile.val());

    var i = 0;
    for (i; i < e.originalEvent.srcElement.files.length; i++) {
      var file = e.originalEvent.srcElement.files[i],
        reader = new FileReader();

      reader.onloadend = function () {
        img.attr('src', reader.result)
      }
      reader.readAsDataURL(file);
      img.removeClass('hidden');
    }

    btn.val(txtAfter);
  });

  $('body').on("click", '.tabs-list li', function () {

    $('.btn-main').removeClass('active');
    $(this).find('.btn-main').addClass('active');
    $('[data-tab-content]').addClass('none');

    $(`[data-tab-content=${$(this).data('content')}]`).removeClass('none');
  });



  $('.deleteLesson').on('click', function (e) {
    var txt;
    if (confirm("Do you want to delete this?")) {

    } else {
      e.preventDefault()
    }

  })

  $('.dropdown-toggle').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).closest('.search-dropdown').toggleClass('open');
  });

  $('.dropdown-menu > li > a').click(function (e) {
    e.preventDefault();
    var clicked = $(this);
    clicked.closest('.dropdown-menu').find('.menu-active').removeClass('menu-active');
    clicked.parent('li').addClass('menu-active');
    clicked.closest('.search-dropdown').find('.toggle-active').html(clicked.html());
  });

  $(document).click(function () {
    $('.search-dropdown.open').removeClass('open');
  });


  $('body').on('click', '.sub-menu_btn', openmenu)


  function openmenu(e) {
    e.stopPropagation()
    e.preventDefault()
    $('.sub-menu').not($(e.target).parent().find('.sub-menu')).removeClass('activeMenu')
    $(e.target).parent().find('.sub-menu').toggleClass('activeMenu')
    $('body').on('click', function () { $('.sub-menu').removeClass('activeMenu') })
  }
})

const isEmptyOrSpaces = (str) => { return str === null || str.match(/^ *$/) !== null }

function back() {
  window.history.back();

}