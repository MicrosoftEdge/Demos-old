// rendering and composition routines
var Gfx = (function () {

    "use strict";

    // brush size to clear the snow
    var brushRadius = 20;
    var clearingBrush;

    // render brush image to use as sprite
    function createClearingBrush() {
        clearingBrush = document.createElement("canvas");
        clearingBrush.width = brushRadius * 2;
        clearingBrush.height = brushRadius * 2;
        var context = clearingBrush.getContext("2d");
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(
        // start x
            brushRadius,
        // start y
            brushRadius,
        // radius
            brushRadius,
        // start angle
            0,
        // finish angle
            2 * Math.PI,
            true);
        context.fill();
    }

    // create the brush right away
    createClearingBrush();

    // render user input using pre-rendered brush
    function renderPath(path, options) {
        var c = options.context;
        setRenderOptions(options);
        for (var ii = 0; ii < path.length; ii++) {
            c.drawImage(
            // image
                clearingBrush,
            // dest x
                path[ii].x - brushRadius / 2,
            // dest y
                path[ii].y - brushRadius / 2);
        }
    }

    // default rendering option
    function getDefaultRenderOptions() {
        var ro = {};
        // clear context
        ro.clearContext = true;
        // fill styles
        ro.fillStyle = "#000000";
        // line styles
        ro.lineWidth = 5;
        ro.lineCap = "round";
        ro.lineJoin = "round";
        // shadow styles
        ro.shadowOffsetX = 0;
        ro.shadowOffsetY = 0;
        ro.shadowBlur = 10;
        ro.shadowColor = "#000000";
        ro.globalCompositeOperation = "source-over";
        ro.globalAlpha = "1.0";
        return ro;
    }

    // set passed rendering options
    function setRenderOptions(ro) {
        if (!ro || !ro.context)
            return;
        var c = ro.context;
        c.fillStyle = ro.fillStyle;
        c.lineWidth = ro.lineWidth;
        c.lineCap = ro.lineCap;
        c.lineJoin = ro.lineJoin;
        c.shadowOffsetX = ro.shadowOffsetX;
        c.shadowOffsetY = ro.shadowOffsetY;
        c.shadowBlur = ro.shadowBlur;
        c.shadowColor = ro.shadowColor;
        c.globalCompositeOperation = ro.globalCompositeOperation;
        c.globalAlpha = ro.globalAlpha;
    }

    // compose layers on top of initial image, using different composite operations
    function composeLayers(compositionPipeline, compositionOptions) {
        // minimal sanity check
        if (!compositionPipeline ||
            !compositionPipeline.length ||
            !compositionPipeline.length > 1)
            return;
        var cp = compositionPipeline, co = compositionOptions,
            c = compositionPipeline[0];
        if (c.save) c.save();
        for (var ii = 1; ii < cp.length; ii++) {
            if (co[ii]) {
                c.globalCompositeOperation = co[ii];
            }
            c.drawImage(cp[ii], 0, 0);
        }
        if (c.restore) c.restore();
    }

    return {
        "renderPath": renderPath,
        "getDefaultRenderOptions": getDefaultRenderOptions,
        "setRenderOptions": setRenderOptions,
        "composeLayers": composeLayers
    }

})();