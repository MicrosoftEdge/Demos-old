// single animation loop and fps calculation
Animation = (function () {

    "use strict";

    // collection of function to render single frame (snowflakes falling, background gradient animation)
    var frameRenderersCollection = [];
    // each animation should be rendered on corresponding context. 
    // If animation doesn't have context (non-visual parameter change every frame) - it should be last (several framerenderers can be last without contexts)
    var renderContextesCollection = [];
    // if animation is running
    var isRunning = false;
    // callback pointer for cancelling
    var animationCallback;
    // if browser doesn't support requestAnimationFrame - we use setInterval for 60Hz displays (16.7ms per frame)
    var minInterval = 16.7;

    // fps tracking
    var avgTime = 0;
    var trackFrames = 60;
    var frameCounter = 0;

    // register new renderer and corresponding context
    function addFrameRenderer(frameRender, renderContext) {
        if (frameRender && typeof (frameRender) === "function") {
            frameRenderersCollection.push(frameRender);
            renderContextesCollection.push(renderContext);
        }
    }

    // detecting requestAnimationFrame feature
    function getRequestAnimationFrame(code) {
        if (window.requestAnimationFrame) {
            return window.requestAnimationFrame(code);
        } else if (window.msRequestAnimationFrame) {
            return window.msRequestAnimationFrame(code);
        } else if (window.webkitRequestAnimationFrame) {
            return window.webkitRequestAnimationFrame(code);
        } else if (window.mozRequestAnimationFrame) {
            return window.mozRequestAnimationFrame(code);
        } else {
            return setTimeout(code, minInterval);
        }
    }

    // iterate and render all registered renderers
    function frameRenderCore() {

        //var startDate = new Date();

        for (var ii = 0; ii < frameRenderersCollection.length; ii++) {
            if (frameRenderersCollection[ii]) {
                frameRenderersCollection[ii](renderContextesCollection[ii]);
            }
        }

        if (isRunning) {
            animationCallback = getRequestAnimationFrame(frameRenderCore);
        }

        //var endDate = new Date();
        //var duration = (endDate - startDate);
        //avgTime += duration;

        //// we count fps every trackFrames frame
        //frameCounter++;
        //if (frameCounter >= trackFrames) {
        //    avgTime = avgTime / trackFrames;
        //    var avgFps = Math.floor(1000 / avgTime);
        //    if (avgFps > 60) avgFps = 60;

        //    // update fps information and snowflake count if dynamic
        //    SystemInformation.post({
        //        fps: avgFps,
        //        snowflakes: (Snowflakes.dynamicSnowflakesCount) ? Snowflakes.count() : ""
        //    });

        //    avgTime = 0;
        //    frameCounter = 0;
        //}
    }

    // playback control: play, pause, toggle
    function start() {
        if (isRunning) return;
        animationCallback = getRequestAnimationFrame(frameRenderCore);
        isRunning = true;
    }

    function stop() {
        if (!isRunning) return;
        clearInterval(animationCallback);
        isRunning = false;
    }

    function toggle() {
        var playbackControl = (isRunning) ? stop : start;
        playbackControl();
    }

    return {
        "addFrameRenderer": addFrameRenderer,
        "start": start,
        "stop": stop,
        "toggle": toggle,
        "getRequestAnimationFrame": getRequestAnimationFrame
    }

})();