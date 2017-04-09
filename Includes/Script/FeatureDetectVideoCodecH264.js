// Define general feature detect for h264 codec support
if(typeof($FeatureDetectVideoCodecH264) == 'undefined')
{
    self.$FeatureDetectVideoCodecH264 = {

        test: function () {
            var video = document.createElement('video');

            if (!video.canPlayType) {
                $FeatureDetect.fail("Your browser doesn't support the HTML5 VIDEO tag, which is needed to run this demo.");
            } else if (!video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
                //$FeatureDetect.fail("Your browser doesn't support the h264 VIDEO codec, which is needed to run this demo. For more information on why IE9 supports h264, please see our earlier <a href='http://blogs.msdn.com/b/ie/archive/2010/04/29/html5-video.aspx'>blog post</a>.");
                $FeatureDetect.fail("Your browser doesn't support the h264 VIDEO codec, which is needed to run this demo.");
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

// Run feature detection
$FeatureDetectVideoCodecH264.test();
