/* globals jQuery */
(function ($) {
    'use strict';

    var scrollTo = function (top) {
        $('html, body').animate({scrollTop: top}, 800, 'easeInOutCirc');
    };

    $('.illo-band').click(function () {
        var height = 0;
        var nav = $('.nav');
        if (nav.length > 0) {
            height = nav.height();
        }
        var offset = $('.coloring-page').offset().top - height;
        scrollTo(offset);
        return false;
    });

}(jQuery));

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing.jswing = jQuery.easing.swing;

/* eslint-disable no-param-reassign, strict */
jQuery.extend(jQuery.easing, {
    def: 'easeOutQuad',
    easeOutQuad: function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
});
/* eslint-enable no-param-reassign, strict */
