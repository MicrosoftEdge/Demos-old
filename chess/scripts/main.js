(function(app, $) {
	'use strict';

	$(document).ready(function() {
		/*eslint-disable no-unused-vars*/
		var match = new app.Match();
		/*eslint-enable no-unused-vars*/

		$(window).on('resize', function() {
			match.resize();
		});
	});
}(window.ChessDemo, window.jQuery));
