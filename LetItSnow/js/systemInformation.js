// system information output + events to react on fps change
SystemInformation = (function () {

    "use strict";

    // get the elements that will be filled with data
    var siBrowser = document.getElementById("siBrowser");
    var siResolution = document.getElementById("siResolution");
    //var siFps = document.getElementById("siFps");
    var siSnowflakes = document.getElementById("siSnowflakesCount");
    // don't know the fps yet
    //var lastFps = 0;

    function getInformation() {
        // at any given point we can collect screen dimensions
        var information = {};
        information.width = window.innerWidth;
        information.height = window.innerHeight;
        return information;
    }

    // event to do something on fps reported
    //var onFpsReport;

    // update page elements to show the updated data
    function post(info) {
        if (!info) return;

        if (info.browser) { siBrowser.textContent = info.browser; }
        if (info.width && info.height) { siResolution.textContent = info.width + "x" + info.height; }
        //if (info.fps) {
        //    lastFps = info.fps;
        //    if (onFpsReport && typeof (onFpsReport) === "function") {
        //        onFpsReport(info.fps);
        //    }
        //    siFps.textContent = info.fps;
        //}
        if (info.snowflakes) {
            if (Snowflakes.dynamicSnowflakesCount) {
                siSnowflakes.textContent = info.snowflakes;
            }
        }
    }

    //function setOnFpsReport(handler) {
    //    onFpsReport = handler;
    //}

    //function getLastFps() {
    //    return lastFps;
    //}

    return {
        "post": post,
        "getInformation": getInformation,
        //"setOnFpsReport": setOnFpsReport,
        //"getLastFps": getLastFps
    }
})();