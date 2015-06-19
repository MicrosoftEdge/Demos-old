(function(){
	'use strict';

	var timeout = 0;

	var schedule = function() {
		timeout = setTimeout(function() {
			postMessage('schedule');
			schedule();
		}, 100);
	};

	self.onmessage = function(e) {
		if (e.data === 'start') {
			if (!timeout) {
				schedule();
			}
		} else if (e.data === 'pause') {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = 0;
		}
	};
}());
