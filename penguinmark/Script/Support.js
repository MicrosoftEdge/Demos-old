window.requestAnimFrame = (function () { return window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); }; })();
window.cancelAnimFrame = (function () { return window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame || window.webkitCancelAnimationFrame })();
window.requestCallback = (function () { return window.setImmediate || window.mozSetImmediate || window.msSetImmediate || window.oSetImmediate || window.webkitSetImmediate || function (callback) { window.setTimeout(callback, 0); }; })();

var browserCheck, browserName, browserVersion, browserPenguin, browserTimerResolution;

function GetBrowserInformation() {

    var UA = navigator.userAgent.toLowerCase();
    var index;

    if (document.documentMode) {
        index = UA.indexOf('msie');
        browserCheck = "IE";
        browserName = "Internet Explorer";
        browserVersion = "" + document.documentMode;
        browserTimerResolution = 16.7;
        browserPenguin = "IEPenguinFull.png";
    }
    else if (UA.indexOf('edge') > -1) {
        index = UA.indexOf('edge');
        browserCheck = "Edge";
        browserName = "Microsoft Edge";
        browserVersion = "(EdgeHTML " + parseFloat('' + UA.substring(index + 5)) + ")";
        browserTimerResolution = 16.7;
        browserPenguin = "IEPenguinFull.png";
    }
    else if (UA.indexOf('chrome') > -1) {
        index = UA.indexOf('chrome');
        browserCheck = "Chrome";
        browserName = "Google Chrome";
        browserVersion = "" + parseFloat('' + UA.substring(index + 7));
        browserTimerResolution = 4;
        browserPenguin = "ChromePenguinFull.png";
    }
    else if (UA.indexOf('firefox') > -1) {
        index = UA.indexOf('firefox');
        browserCheck = "Firefox";
        browserName = "Mozilla Firefox";
        browserVersion = "" + parseFloat('' + UA.substring(index + 8));
        browserTimerResolution = 10;
        browserPenguin = "FirefoxPenguinFull.png";
    }
    else if (UA.indexOf('minefield') > -1) {
        index = UA.indexOf('minefield');
        browserCheck = "Firefox";
        browserName = "Mozilla Firefox Minefield";
        browserVersion = "" + parseFloat('' + UA.substring(index + 10));
        browserTimerResolution = 10;
        browserPenguin = "FirefoxPenguinFull.png";
    }
    else if (UA.indexOf('opera') > -1) {
        browserCheck = "Opera";
        browserName = "Opera";
        browserVersion = "";
        browserTimerResolution = 4;
        browserPenguin = "OperaPenguinFull.png";
    }
    else if (UA.indexOf('safari') > -1) {
        index = UA.indexOf('safari');
        browserCheck = "Safari";
        browserName = "Apple Safari";
        browserVersion = "" + parseFloat('' + UA.substring(index + 7));
        browserTimerResolution = 10;
        browserPenguin = "SafariPenguinFull.png";
    }
}
