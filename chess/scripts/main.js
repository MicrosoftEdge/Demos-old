(function(app, $) {
	'use strict';

	/*eslint-disable*/
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
	/*eslint-enable*/

	let match;

	$(document).ready(function() {
		/*eslint-disable no-unused-vars*/
		match = new app.Match();
		/*eslint-enable no-unused-vars*/

		$(window).on('resize', debounce(function() {
			match.resize();
		}, 100));

		$('#chess__enable-asm, #chess__enable-asm-close').on('click', function(e) {
			if (!$(e.target).is('a')) {
				$('#chess__enable-asm').toggleClass('chess__show-detail');
				return false;
			}
			return null;
		});
	});
}(window.ChessDemo, window.jQuery));
