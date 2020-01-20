var PC_FIXED = false;
var SP_FIXED = false;
var SP_WIDTH = 769;
var SPEED = 500;
let headerHeight  = $('header');

function scrollPosition(position) {
  position -= PC_FIXED && $(window).innerWidth() >= SP_WIDTH || SP_FIXED && $(window).innerWidth() < SP_WIDTH ? headerHeight.innerHeight() : 0;
  $('html, body').animate({
    scrollTop: position
  }, SPEED);
}

//（<a href="#top">の様に記述すると滑らかにスクロールする。）
$(function () {
  $('a[href*="#"]').click(function () {
    scrolled = $(window).scrollTop();
    var position = $(this.hash).length > 0 ? $(this.hash).offset().top : scrolled;
    scrollPosition(position);
  });
});

// 一定量スクロールするとページトップに戻るが表示される（場所等の指定はcommon.scssにて）
$(function () {
  var top_btn = $('.pagetop');
  top_btn.hide();
  $(window).scroll(function () {
    $(this).scrollTop() > 100 ? top_btn.fadeIn() : top_btn.fadeOut();
  });

  top_btn.click(function () {
    scrollPosition(0);
    return false;
  });
});

// rollover（_offと末尾についた画像をオンマウスで_onとついた画像に切り替える）
$(function () {
  $('img').hover(
    function () {
      $(this).attr('src', $(this).attr('src').replace('_off.', '_on.'));
    },
    function () {
      $(this).attr('src', $(this).attr('src').replace('_on.', '_off.'));
    }
  );
});

$(function () {
  var menu_btn = $('.slidemenu-btn');
  var body = $(document.body);
  var top = 0;
  var menu_open = false;

  menu_btn.on('click', function () {
    if (!menu_open) {
      top = $(window).scrollTop();
    }
    body.toggleClass('open');
    menu_btn.toggleClass('active');
    menu_open = true;
    if (body.hasClass('open')) {
      body.css({
        'height': window.innerHeight,
        'top': -top
      });
    } else {
      body.removeAttr('style');
      $(window).scrollTop(top);
      menu_open = false;
    }
  });
});

//ヘッダーが固定の時スマホの時のページ内リンク用
$(function () {
  $(document).on('ready', function() {
    if (location.hash != "") {
	    var pos = $(location.hash).offset().top;
      if (PC_FIXED && $(window).innerWidth() >= SP_WIDTH || SP_FIXED && $(window).innerWidth() < SP_WIDTH) {
        pos -= $('header').innerHeight();
        $("html, body").animate({ scrollTop: pos }, 1, "swing");
      }
      else {
        return false;
      }
    }
  });
});
