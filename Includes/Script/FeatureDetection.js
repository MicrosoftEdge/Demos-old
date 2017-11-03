(function() {

    var detectors = {}, // Feature Detectors
        debugMode = false, // Toggles debug messages
        ie = { full : "fullie", ppb : "ppb", win8 : "win8" }; // IE Flavors

    // Log messages
    var log = function(message) {
        if(console && console.log) {
            console.log(message);
        }
    }

    // Log debug messages
    var debug = function(message) {
        if(debugMode) {
            log(message);
        }
    }

    // Helper object to parse the query string for values
    var queryStringHelper = {
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

    // Helper object to get information about browser (through UA string and checking other properties)
    var browserInfo = (function () {

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
        if (version = document.documentMode) {
            isIE = true;
            browserVerison = document.documentMode;
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
            if (typeof window.external === 'object' && window.external == null) {
                isPPB = true;
            }
        }

        // Returns true if browser is any version of Internet Explorer, false otherwise
        var isInternetExplorer = function () {
            return isIE;
        }

        // Returns true if browser is any version of Internet Explorer Platform Preview, false otherwise
        var isPlatformPreview = function () {
            return isPPB;
        }

        // Returns true if browser is Internet Explorer 9 Platform Preview 6, or greater
        var isPlatformPreview6Plus = function () {
            return isPPB6;
        }

        // Returns true if browser is any version of Chrome, false otherwise
        var isChrome = function () {
            return isChrome;
        }

        // Returns true if browser is any version of Firefox, false otherwise
        var isFirefox = function () {
            return isFirefox;
        }

        // Returns true if browser is any version of Opera, false otherwise
        var isOpera = function () {
            return isOpera;
        }

        // Returns true if browser is any version of Safari, false otherwise
        var isSafari = function () {
            return isSafari;
        }

        // Returns browser version, as float
        var version = function () {
            return browserVerison;
        }

        return {
            isInternetExplorer : isInternetExplorer,
            isPlatformPreview : isPlatformPreview,
            isPlatformPreview6Plus : isPlatformPreview6Plus,
            isChrome : isChrome,
            isFirefox : isFirefox,
            isOpera : isOpera,
            isSafari : isSafari,
            version : version
        }
    }());

    // Add new feature detector to list
    var addDetector = function(name, description, failureMessage, upgradeChoices, testFunc) {
        detectors[name] = {
            name : name,
            description : description,
            failureMessage : failureMessage,
            upgradeChoices : upgradeChoices,
            test : testFunc
        };
    }

    // Called when feature detection test fails
    var fail = function(detector) {
        var choices = "&choices=" + encodeURI(detector.upgradeChoices);
            message = encodeURI(detector.failureMessage);

        debug("FAIL! (feature detector '" + detector.name + "'):");

        window.location.replace("http://ie.microsoft.com/testdrive/Info/MissingBrowserFeature/Default.html?message=" +
                                message + "&url=" + window.location + choices);
    }

    // Called when feature detection passes
    var pass = function(detector) {
       debug("PASS! (feature detector '" + detector.name + "'):");
    }

    //  Run configured detectors
    var run = function() {

        var scriptTags,
            scriptTag,
            detect,
            selectedDetectors,
            detector;

        // Find script tag
        scriptTags = document.getElementsByTagName("script");

        for(var i = 0; i < scriptTags.length; i++) {
            if(scriptTags[i].getAttribute("data-detect") !== null) {
                scriptTag = scriptTags[i];
                break;
            }
        }

        if(typeof scriptTag === 'undefined') {
            log("Feature Detection Error: detect attribute not found on script tag");
        }

        if(queryStringHelper.parse("o") === "1") {
            debug("Ignoring feature detection logic and proceeding with page load.");
            return;
        }

        if(typeof scriptTag !== 'undefined') {
            detect = scriptTag.getAttribute("data-detect");
            selectedDetectors = detect.split(" ");

            for(var i = 0; i < selectedDetectors.length; i++) {

                if(selectedDetectors[i].toUpperCase() === '[LIST]') {
                    list();
                } else if(selectedDetectors[i].toUpperCase() === '[DEBUG]'){
                    debugMode = true;
                } else {
                    detector = detectors[selectedDetectors[i]];

                    if(typeof detector !== 'undefined') {
                        debug("Running '" + detector.name + "' feature detector [" + detector.description + "]");

                        if(detector.test(detector)) {
                            pass(detector);
                        } else {
                            fail(detector);
                        }
                    } else {
                        debug("Feature detector '" + selectedDetectors[i] + "' does not exist.");
                    }
                }
            }
        }
    }

    //  List all available detectors
    var list = function() {

        debug("\nAVAILABLE FEATURE DETECTORS:");
        debug("============================\n");

        for(i in detectors) {
            if(detectors.hasOwnProperty(i)) {
                var detector = detectors[i];
                var message = "   ";

                message += detector.name;

                var padBy = 30 - detector.name.length;

                if(padBy > 0) {
                    for(var s = 0; s < padBy; s++) {
                            message += " ";
                    }
                }

                message += "[" + detector.description + "]\n";

                log(message);
            }
        }

    }

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  HTML 5 video tag
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "video",

                // Description (used for debugging only)
                "Fails if the HTML5 video element is not available",

                // Failure message (displayed to users)
                "Your browser doesn't support the HTML5 video tag",

                // Upgrade choices (PPB and or latest Full IE)
                ie.full + ie.ppb,

                // Function that tests functionality
                function(detector) {
                    var testPassed = false,
                        video = document.createElement("video");

                    if(typeof video.play === 'function') {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Audio
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "audio",

                // Description (used for debugging only)
                "Fails if the browser does not support HTML5 Audio element",

                // Failure message (displayed to user)
                "Your browser doesn't support the HTML5 Audio tag.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
                        audio = document.createElement('audio');


                    if(typeof audio.play === 'function') {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Canvas
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "canvas",

                // Description (used for debugging only)
                "Fails if the browser does not support the HTML5 Canvas element",

                // Failure message (displayed to user)
                "Your browser doesn't support the HTML5 Canvas tag.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
                        canvas = document.createElement('canvas');

                    if(typeof canvas.getContext === 'function') {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Gesture
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "gesture",

                // Description (used for debugging only)
                "Fails if the browser does not support MSGesture",

                // Failure message (displayed to user)
                "Your browser doesn't support gestures.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
					    gesture = !!window.navigator.msPointerEnabled;

					testPassed = gesture;
                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Media Queries
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "styleMedia",

                // Description (used for debugging only)
                "Fails if the browser does not support CSS3 Media Queries",

                // Failure message (displayed to user)
                "Your browser doesn't support CSS3 Media Queries.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
					    media = !!window.styleMedia || !!window.matchMedia;

					testPassed = media;
                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  XHTML support
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "xhtml",

                // Description (used for debugging only)
                "Fails if the browser does not support XHTML",

                // Failure message (displayed to users)
                "Your browser doesn't support XHTML documents",

                // Upgrade choices (PPB and or latest Full IE)
                ie.full + ie.ppb,

                // Function that tests functionality
                function(detector) {
                    var testPassed = false,
                        xhtml = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');

                    if(xhtml.tagName) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  h264 video codec support
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "h264",

                // Description (used for debugging only)
                "Fails if the browser can't play h264 videos",

                // Failure message (displayed to user)
                "Your browser doesn't support the h264 video codec, which is needed to run this demo",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
                        video = document.createElement("video");

                    if(video.canPlayType &&
                       video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  SVG support
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "svg",

                // Description (used for debugging only)
                "Fails if the browser doesn't understand SVG",

                // Failure message (displayed to user)
                "Your browser doesn't support HTML5 SVG",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
                        svgSupported = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Structure", "1.1");

                    if(svgSupported) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  HTML5 semantic elements
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "semanticElements",

                // Description (used for debugging only)
                "Fails if the browser doesn't understand HTML5 semantic elements",

                // Failure message (displayed to user)
                "Your browser doesn't support the HTML5 Semantic Elements.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
                        section = document.createElement('section');

                    if(section.toString() === "[object HTMLElement]") {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  IE Site Pinning
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "pinning",

                // Description (used for debugging only)
                "Fails if the browser doesn't support site pinning",

                // Failure message (displayed to user)
                "Your browser doesn't support the window.external.msIsSiteMode API.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(window.external && "msIsSiteMode" in window.external) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Navigation Timing spec
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "navigationTiming",

                // Description (used for debugging only)
                "Fails if the browser doesn't expose window.performance, msPerformance, or webkitPerformance",

                // Failure message (displayed to user)
                "Your browser doesn't support the W3C Navigation Timing interface.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(window.msPerformance || window.webkitPerformance || window.performance) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Checks for IE9 (must be full build, not PPB)
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "ie9PlusFull",

                // Description (used for debugging only)
                "Fails if the browser is not a full build (not PPB) of IE, version 9 or higher",

                // Failure message (displayed to user)
                "This demo requires a full install of Internet Explorer 9 to run.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(browserInfo.isInternetExplorer() &&
                       !browserInfo.isPlatformPreview() &&
                       browserInfo.version() >= 9) {

                        testPassed = true;

                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Checks for IE9 plus dev tools (full build or ppb works)
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "ie9PlusDevTools",

                // Description (used for debugging only)
                "Fails if the browser is not a build of IE (Full or PPB) and version 9 or higher",

                // Failure message (displayed to user)
                "This demo requires a version of Internet Explorer 9 or higher to run.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function (detector) {
                    var testPassed = false;

                    if (browserInfo.isInternetExplorer() &&
                       browserInfo.version() >= 9) {

                        testPassed = true;

                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Checks if object HtmlElement is defined
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "htmlElement",

                // Description (used for debugging only)
                "Fails if the browser does not define HtmlElement as global object",

                // Failure message (displayed to user)
                "Your browser doesn't support the HTMLElement object from script.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(typeof HTMLElement !== 'undefined') {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Does browser DOM support getElementsByClassName()
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "domGetElementsByClassName",

                // Description (used for debugging only)
                "Fails if the browser does not support DOM getElementsByClassName() API",

                // Failure message (displayed to user)
                "Your browser doesn't support the DOM getElementsByClassName() API.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(typeof document.getElementsByClassName !== 'undefined') {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Geolocation
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "geolocation",

                // Description (used for debugging only)
                "Fails if the browser does not support Geolocation API",

                // Failure message (displayed to user)
                "Your browser doesn't support the W3C Geolocation API.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(navigator && typeof navigation.geolocation !== 'undefined') {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  ES5 Object.defineProperties / defineProperty
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "es5properties",

                // Description (used for debugging only)
                "Fails if the browser does not support ES5 Object.defineProperties or Object.defineProperty",

                // Failure message (displayed to user)
                "Your browser doesn't support the ES5 properties API.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(Object.defineProperties && Object.defineProperty) {
                        testPassed = true;
                    }

                    return testPassed;
                });

	//  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  ES5 Object.keys
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "es5objectKeys",

                // Description (used for debugging only)
                "Fails if the browser does not support ES5 Object.keys",

                // Failure message (displayed to user)
                "Your browser doesn't support the Object.Keys method.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(Object.keys) {
                        testPassed = true;
                    }

                    return testPassed;
                });


    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  ES5 array methods
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "es5arrays",

                // Description (used for debugging only)
                "Fails if the browser does not support ES5 array methods",

                // Failure message (displayed to user)
                "Your browser doesn't support the ES5 array methods.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if([].filter && [].indexOf && [].lastIndexOf && [].every &&
                       [].some && [].forEach && [].map && [].reduce && [].reduceRight) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  DOM Traversal
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "domTraversal",

                // Description (used for debugging only)
                "Fails if the browser does not support DOM Traversal (document.createNodeIterator)",

                // Failure message (displayed to user)
                "Your browser doesn't support DOM Traversal.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(document.createNodeIterator) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  DOM Range
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "domRange",

                // Description (used for debugging only)
                "Fails if the browser does not support DOM Range",

                // Failure message (displayed to user)
                "Your browser doesn't support DOM Range and/or HTML5 Selection.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(document.createRange && window.getSelection) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  DOM Parser and XMLSerializer
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "domParser",

                // Description (used for debugging only)
                "Fails if the browser does not support DOMParser or XMLSerializer",

                // Failure message (displayed to user)
                "Your browser doesn't support DOMParser and/or XMLSerializer.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(self.DOMParser && self.XMLSerializer) {
                        testPassed = true;
                    }

                    return testPassed;
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  CSS3 Floats
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "positionedFloat",

                // Description (used for debugging only)
                "Fails if the browser does not support CSS3 Floats",

                // Failure message (displayed to user)
                "Your browser doesn't support CSS3 Floats.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false,
                        positionedFloat = document.createElement("div");

                    positionedFloat.style.cssFloat = "-ms-positioned";
                    positionedFloat.style.msWrapSide = "both";

                    if (positionedFloat.style.cssFloat == "-ms-positioned" || positionedFloat.style.msWrapSide == "both") {
                        testPassed = true;
                    }

                    return testPassed;
                });

	//  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  Win8 or touch supported browser
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "IE10OrTouch",

                // Description (used for debugging only)
                "Fails if the browser is not IE10 or a browser that supports touch events",

                // Failure message (displayed to user)
                "Your browser doesn't support Touch events.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.win8,

                // Function that performs feature detection.
                function(detector) {
                    return window.navigator.msPointerEnabled || ("ontouchstart" in document.createElement('div'))  || ("TouchEvent" in window);
                });

    //  -----------------------------------------------------------------------
    //  FEATURE DETECTOR:  JavaScript Intl
    //  -----------------------------------------------------------------------
    addDetector(
                // Name of detector
                "JSIntl",

                // Description (used for debugging only)
                "Fails if the browser does not support Intl methods",

                // Failure message (displayed to user)
                "Your browser doesn't support the JavaScript Intl feature.",

                // Upgrade choices (PPB and/or latest full IE build)
                ie.full + ie.ppb,

                // Function that performs feature detection.
                function(detector) {
                    var testPassed = false;

                    if(typeof(Intl) == "object" && typeof(Intl.Collator) == "function"
                        && typeof(Intl.NumberFormat) == "function" && typeof(Intl.DateTimeFormat) == "function") {
                        testPassed = true;
                    }

                    return testPassed;
                });



    run();
}());
