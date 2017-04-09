// Helper object to get information about browser (through UA string and checking other properties)
var browserInfo = (function () {

	// "Modern" dependencies
	// * DataView (has special no-exist handling)
	// * HTMLCanvasElement
	// * Uint8Array
	// * FileReader
	// * (URL || window.webkitURL)
	// * Blob
	// * WebKitBlobBuilder
	// * HTMLVideoElement
	// * HTMLSourceElement

	var isPPB = false; // if true, browser is an Internet Explorer platform preview
	var isPPB6 = false; // if true, browser is IE9 PPB6 or newer
	var isIE = false; // if true, browser is any version of Internet Explorer (including platform previews)
	var isChrome = false; // if true, browser is any version of Chrome
	var isOpera = false; // if true, browser is any version of Opera
	var isSafari = false; // if true, browser is any version of Safari
	var isFirefox = false; // if true, browser is any version of Firefox
	var browserVersion = 0; // Browser version number

	/*  Initialize flags ------------------------------------------------*/
	var version;

	// Parse UA string for browser name and version
	if (document.documentMode) {
		isIE = true;
		//		browserVersion = parseFloat(version[1]);
		browserVersion = document.documentMode;
	} else if (version = /Firefox\/(\d+\.\d+)/.exec(navigator.userAgent)) {
		isFirefox = true;
		browserVersion = parseFloat(version[1]);
	} else if (version = /Chrome\/(\d+\.\d+)/.exec(navigator.userAgent)) {
		isChrome = true;
		browserVersion = parseFloat(version[1]);
	} else if (version = /Opera.*Version\/(\d+\.\d+)/.exec(navigator.userAgent)) {
		isOpera = true;
		browserVersion = parseFloat(version[1]);
	} else if (version = /Version\/(\d+\.\d+).*Safari/.exec(navigator.userAgent)) {
		isSafari = true;
		browserVersion = parseFloat(version[1]);
	}

	// Check if this is an IE platform preview build, and if so, which one.
	if (isIE && typeof document.documentMode != 'undefined') {
		if (typeof window.external === 'object' && window.external == null) {
			isPPB = true;
		}
	}

	// Returns true if browser is any version of Internet Explorer, false otherwise
	var IsIE = function () {
		return isIE;
	};

	// Returns true if browser is any version of Internet Explorer Platform Preview, false otherwise
	var IsPlatformPreview = function () {
		return isPPB;
	};

	// Returns true if browser is Internet Explorer 9 Platform Preview 6, or greater
	var IsPlatformPreview6Plus = function () {
		return isPPB6;
	};

	// Returns true if browser is any version of Chrome, false otherwise
	var IsChrome = function () {
		return isChrome;
	};

	// Returns true if browser is any version of Firefox, false otherwise
	var IsFirefox = function () {
		return isFirefox;
	};

	// Returns true if browser is any version of Opera, false otherwise
	var IsOpera = function () {
		return isOpera;
	};

	// Returns true if browser is any version of Safari, false otherwise
	var IsSafari = function () {
		return isSafari;
	};

	// Returns browser version, as float
	var BrowserVersion = function () {
		return browserVersion;
	};

	return {
		isIE: IsIE(),
		isPlatformPreview: IsPlatformPreview(),
		isPlatformPreview6Plus: IsPlatformPreview6Plus(),
		isChrome: IsChrome(),
		isFirefox: IsFirefox(),
		isOpera: IsOpera(),
		isSafari: IsSafari(),
		version: BrowserVersion()
	};
}());
