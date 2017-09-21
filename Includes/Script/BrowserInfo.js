if (typeof (self.$BrowserInfo) == "undefined") {
    self.$BrowserInfo = new function () {

        var isPPB = false;                  // if true, browser is an Internet Explorer platform preview
        var isPPB6 = false;                 // if true, browser is IE9 PPB6 or newer
        var isIE = false;                   // if true, browser is any version of Internet Explorer (including platform previews)
        var isChrome = false;               // if true, browser is any version of Chrome
        var isOpera = false;                // if true, browser is any version of Opera
        var isSafari = false;               // if true, browser is any version of Safari
        var isFirefox = false;              // if true, browser is any version of Firefox
        var browserVersion = 0;             // Browser version number
        var supportsGeolocation = false;    // Used to determine if this is RC+ build of IE9

        /*  Initialize flags ------------------------------------------------*/
        var version;

        // Parse UA string for browser name and version
        if (version = /MSIE (\d+\.\d+)/.exec(navigator.userAgent)) {
            isIE = true;
            browserVersion = parseFloat(version[1]);
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

                if (!(document.createElement("article") instanceof HTMLUnknownElement)) {
                    isPPB6 = true;
                }
            }
        }

        // Check if browser supports geolocation
        if (navigator && typeof navigator.geolocation != "undefined") {
            supportsGeolocation = true;
        }

        // Returns true if browser is any version of Internet Explorer, false otherwise
        this.IsBrowserInternetExplorer = function () {
            return isIE;
        }

        // Returns true if browser is IE9 RC or later (will return false on any PPB build)
        this.IsBrowserInternetExplorer9RCPlus = function () {
            return (supportsGeolocation && isIE && !isPPB);
        }

        // Returns true if browser is IE9 RC or later including PPB's.
        this.IsBrowserInternetExplorer9RCPlusOrLater = function () {
            return (supportsGeolocation && isIE);
        }

        // Returns true if browser is any version of Internet Explorer Platform Preview, false otherwise
        this.IsBrowserPlatformPreview = function () {
            return isPPB;
        }

        // Returns true if browser is Internet Explorer 9 Platform Preview 6, or greater
        this.IsBrowserPlatformPreview6Plus = function () {
            return isPPB6;
        }

        // Returns true if browser is any version of Chrome, false otherwise
        this.IsBrowserChrome = function () {
            return isChrome;
        }

        // Returns true if browser is any version of Firefox, false otherwise
        this.IsBrowserFirefox = function () {
            return isFirefox;
        }

        // Returns true if browser is any version of Opera, false otherwise
        this.IsBrowserOpera = function () {
            return isOpera;
        }

        // Returns true if browser is any version of Safari, false otherwise
        this.IsBrowserSafari = function () {
            return isSafari;
        }

        // Returns browser version, as float
        this.GetBrowserVersion = function () {
            return browserVersion;
        }
    }
}

