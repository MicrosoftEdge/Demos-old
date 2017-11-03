if(typeof($FeatureDetectPinning) == 'undefined')
{
    self.$FeatureDetectDOMPinning = {

		test : function()
		{
			if (!window.external.msSiteModeSetIconOverlay) {
				$FeatureDetect.fail("Your browser doesn't support site mode.");
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
$FeatureDetectDOMPinning.test();
