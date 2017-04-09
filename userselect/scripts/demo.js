(function () {
	'use strict';

	var switchSheets = function (sheet) {

		try {
			document.selection.empty();
		} catch (e) {
		}
		var sheets = document.getElementsByClassName('styles');
		for (var i = 0; i < sheets.length; i++) {
			if (sheets[i].id.replace('_sheet', '') === sheet) {
				sheets[i].sheet.disabled = false;
				document.getElementById(sheet).style.display = 'block';

			} else {
				if (sheets[i].id !== '') {
					sheets[i].sheet.disabled = true;
					document.getElementById(sheets[i].id.replace('_sheet', '')).style.display = 'none';
				}
			}
		}
	};

	var init = function () {
		if (!document.getElementsByClassName) {
			document.getElementById('sel').disabled = true;
			document.getElementById('sel').title = 'Your browser does not support the functionality needed to run this demo, please try it in IE10 PPB4.';
			return;
		}
		if (!(('msUserSelect' in document.body.style) || ('MozUserSelect' in document.body.style) || ('webkitUserSelect' in document.body.style))) {
			document.getElementById('sel').title = 'Your browser does not support the user-select style, please upgrade to a modern browser.';
		}

		document.getElementById('sel').addEventListener('change', function (evt) {
			var sheet = evt.target.value;
			switchSheets(sheet);
		}, false);

		switchSheets('on');
	};

	init();
}());
