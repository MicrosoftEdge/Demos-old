(function () {
	'use strict';

	var getMediaErrorString = function (vid) {
		try {
			switch (vid.error.code) {
				case vid.error.MEDIA_ERR_ABORTED:
					return 'You aborted the video playback.';
				case vid.error.MEDIA_ERR_NETWORK:
					return 'A network error caused the video download to fail part-way.';
				case vid.error.MEDIA_ERR_DECODE:
					return 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
				case vid.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
					return 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
				default:
					return 'An unknown error occurred.';
			}
		} catch (exp) {
			return 'Your browser does not fully implement the HTML5 video element.';
		}
	};

	var videoFail = function () {
		var that = this;
		var errorAdded = false;
		var vidparent = that.parentNode;
		var viddivs = that.getElementsByClassName('sorry');
		while (viddivs.length > 0) {
			var div = viddivs[0];
			that.removeChild(div);
			//	some complications so that in IE9 we offer to install WebM
			var addDiv = true;
			if (div.className.indexOf('no-ie9') !== -1) {
				addDiv = document.documentMode == null || document.documentMode < 9;
			} else if (div.className.indexOf('install-web-m') !== -1) {
				addDiv = document.documentMode != null && document.documentMode >= 9;
				if (addDiv) {
					div.style.display = 'table-cell';
				}
			}
			if (addDiv) {
				vidparent.insertBefore(div, that);
				if (!errorAdded) {
					div.appendChild(document.createElement('br'));
					div.appendChild(document.createElement('br'));
					div.appendChild(document.createTextNode(getMediaErrorString(that)));
					errorAdded = true;
				}
			}
		}
		vidparent.removeChild(that);
	};

	var registerEvents = function () {
		var h264highVideo = document.getElementById('h264high-video');
		var webmVideo = document.getElementById('webm-video');
		var h264baselineVideo = document.getElementById('h264baseline-video');

		h264highVideo.addEventListener('error', videoFail, false);
		webmVideo.addEventListener('error', videoFail, false);
		h264baselineVideo.addEventListener('error', videoFail, false);
	};

	registerEvents();
}());
