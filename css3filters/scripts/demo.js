/*eslint-env jquery */

(function () {
	'use strict';

	var filters = [
		'grayscale',
		'sepia',
		'saturate',
		'invert',
		'opacity',
		'brightness',
		'contrast'
	];

	filters.forEach(function (filter) {
		var input = $('#' + filter + '-sldr');
		input.change(function () {
			$('.' + filter).css('filter', filter + '(' + input.val() + '%)');
			$('.' + filter).css('-webkit-filter', filter + '(' + input.val() + '%)');
		});
		input.trigger('change');
	});

	var hue = $('#hue-rotate-sldr');
	hue.change(function () {
		$('.hue-rotate').css('filter', 'hue-rotate(' + hue.val() + 'deg)');
		$('.hue-rotate').css('-webkit-filter', 'hue-rotate(' + hue.val() + 'deg)');
	});
	hue.trigger('change');

	var blur = $('#blur-sldr');
	blur.change(function () {
		$('.blur').css('filter', 'blur(' + blur.val() + 'px)');
		$('.blur').css('-webkit-filter', 'blur(' + blur.val() + 'px)');
	});
	blur.trigger('change');

}());
