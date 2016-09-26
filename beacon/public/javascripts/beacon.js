// Flag to determine if beacon has been used
var usedBeacon = false;


// Sends a beacon with the current time and returns true
var sendBeacon = function() {
	'use strict';
	console.log('Sending beacon');
	navigator.sendBeacon('/data', Date.now().toString());
	return true;
};

// Sends an XMLHttpRequest with the current time
var sendXhr = function() {
	'use strict';
	console.log('Falling back to async xhr');
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/data', true); // async
	xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
	xhr.send(Date.now().toString());
};

// Report error if sendBeacon not supported
if (!navigator.sendBeacon) {
	document.getElementById('error').innerHTML = '<p id="error">Your browser does not support the Beacon API. XMLHTTPRequest will be used instead.';
}

// Upon visibilitychange, send request to the server
document.addEventListener('visibilitychange', function() {
	'use strict';
   // Use sendBeacon if supported

	if (navigator.sendBeacon) {
		usedBeacon = sendBeacon();
	}

   // Fallback to async XMLHttpRequest if beacon is not supported
	if (!usedBeacon) {
		sendXhr();
	}

   // Re-render the page with the latest available roundtrip data (there’s no guarantee this last one has returned yet)
	location.reload();
});


