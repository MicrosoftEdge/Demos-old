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

        /*  Initialize flags ------------------------------------------------*/
        var version;

        // Parse UA string for browser name and version
        if (version = /MSIE (\d+\.\d+)/.exec(navigator.userAgent)) {
            isIE = true;
            browserVerison = parseFloat(version[1]);
        } else if (version = /Firefox\/(\d+\.\d+)/.exec(navigator.userAgent)) {
            isFirefox = true;
            browserVerison = parseFloat(version[1]);
        } else if (version = /Chrome\/(\d+\.\d+)/.exec(navigator.userAgent)) {
            isChrome = true;
            browserVerison = parseFloat(version[1]);
        } else if (version = /Opera.*Version\/(\d+\.\d+)/.exec(navigator.userAgent)) {
            isOpera = true;
            browserVerison = parseFloat(version[1]);
        } else if (version = /Version\/(\d+\.\d+).*Safari/.exec(navigator.userAgent)) {
            isSafari = true;
            browserVerison = parseFloat(version[1]);
        }

        // Check if this is an IE platform preview build, and if so, which one.
        if (isIE && typeof document.documentMode != 'undefined') {
            if (window.external == null) {
                isPPB = true;

                if (!(document.createElement("article") instanceof HTMLUnknownElement)) {
                    isPPB6 = true;
                }
            }
        }

        // Returns true if browser is any version of Internet Explorer, false otherwise
        this.IsBrowserInternetExplorer = function () {
            return isIE;
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
            return browserVerison;
        }
    }
}



// Define general feature detect for ensuring user has the full build of IE (not PPB) version 9 or greater
if(typeof($FeatureDetectIEFullBrowser9Plus) == 'undefined')
{
    self.$FeatureDetectIEFullBrowser9Plus = {

        test: function () {

            var ppb = $BrowserInfo.IsBrowserPlatformPreview();

            if (ppb) {
                $FeatureDetect.fail("The Platform Preview does not have the user interface features needed to view this demo.", "fullie");
            }
        }
    }
};

// Define Feature Detect logic for displaying failure message
if (typeof ($FeatureDetect) == 'undefined') {
    self.$FeatureDetect = {

        fail: function (message, upgradeChoices) {

            var choices = "";

            if (upgradeChoices) {
                choices = "&choices=" + encodeURI(upgradeChoices);
            }

            if ($QueryStringHelper.parse("o") == "1") {
                return;
            }

            window.location.replace("../../Info/MissingBrowserFeature/Default.html?message=" + encodeURI(message) + "&url=" + window.location + choices);

        }
    }
}

// Define helper object to parse query string
if (typeof ($QueryStringHelper) == "undefined") {
    self.$QueryStringHelper = {
        parse: function (variable) {
            var query = window.location.search.substring(1);
            var vars = query.split("&");

            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1].replace(/%20/g, " ");
                }
            }

            return false;
        }
    }
}

// Special thanks to QuirksMode.org (http://www.quirksmode.org/js/cookies.html) for these
// excellent cookie helper functions
if (typeof (createCookie) != "function") {
    self.createCookie = function (name, value, ms) {
        if (ms) {
            var date = new Date();
            date.setTime(date.getTime() + (ms));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
}

if (typeof (readCookie) != "function") {
    self.readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}

if (typeof (eraseCookie) != "function") {
    self.eraseCookie = function (name) {
        createCookie(name, "", -1);
    }
}

$FeatureDetectIEFullBrowser9Plus.test();
