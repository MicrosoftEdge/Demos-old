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

	var match;

	$(document).ready(function() {
		/*eslint-disable no-unused-vars*/
		match = new app.Match();
		/*eslint-enable no-unused-vars*/

		$(window).on('resize', debounce(function() {
			match.resize();
		}, 100));
	});
}(window.ChessDemo, window.jQuery));
