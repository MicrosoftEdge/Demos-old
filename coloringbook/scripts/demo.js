/* globals jQuery */
(function ($) {
	'use strict';

	var scrollTo = function (top) {
		$('html, body').animate({scrollTop: top}, 800, 'easeInOutCirc');
	};

	$('#top').click(function () {
		scrollTo(0);
	});

	$('#introTiles').click(function () {
		var offset = $('#page01').offset().top;
		scrollTo(offset);
		return false;
	});

	$(window).scroll(function () {
		var top = $('body').scrollTop(),
			height = $(window).height();
		$('#top').toggleClass('showing', top > height);
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