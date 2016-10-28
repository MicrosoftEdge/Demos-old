// background gradient special effects animation
var Gradient = (function () {

    "use strict";

    // moving gradient stop point
    var minMovingStop = 0.25;
    var maxMovingStop = 0.80;
    // the speed of size increase/decrease
    var movingStopIncrement = 0.0001;
    var currentMovingStop = minMovingStop;

    // background gradient is tinting the values using these corrections (currently - all gray)
    var holidayLights = [[0.75, 0.75, 0.75], [0.9, 0.9, 0.9], [0.5, 0.5, 0.5]];
    var redIntensity = holidayLights[0][0];
    var greenIntensity = holidayLights[0][1];
    var blueIntensity = holidayLights[0][2];
    var currentHolidayLight = 0;

    // iterate through color tinting values
    function nextColor() {
        if (++currentHolidayLight >= holidayLights.length) {
            currentHolidayLight = 0;
        }
        redIntensity = holidayLights[currentHolidayLight][0];
        greenIntensity = holidayLights[currentHolidayLight][1];
        blueIntensity = holidayLights[currentHolidayLight][2];
    }

    // individual frame render routine
    function renderFrame(context) {
        // start with clean context
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        //prepare the gradient
        var gradient = context.createRadialGradient(
        // start x
            context.canvas.width / 2,
        // start y
            0,
        // start r
            0,
        // stop x
            context.canvas.width / 2,
        // stop y
            context.canvas.height,
        // stop r
            context.canvas.height * 1.5);

        // compose the colors
        var colorMidStopElement = Math.ceil(255 * (1 - currentMovingStop / 2));
        var colorStopElement = Math.ceil(255 * (1 - currentMovingStop));

        // start color stop
        var colorStart = "rgba(255,255,255," + currentMovingStop + ")"
        // mid color stop
        var colorMidStop = "rgba(" +
            Math.ceil(colorMidStopElement * redIntensity) + ", " +
            Math.ceil(colorMidStopElement * greenIntensity) + ", " +
            Math.ceil(colorMidStopElement * blueIntensity) + ", " +
            currentMovingStop / 1.25 + ")";
        // final color stop
        var colorStop = "rgba(" +
            Math.ceil(colorStopElement * redIntensity) + ", " +
            Math.ceil(colorStopElement * greenIntensity) + ", " +
            Math.ceil(colorStopElement * blueIntensity) + ", " +
            currentMovingStop / 1.25 + ")";        
        
        // compose the gradient points dynamically for subtle glowing effect
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(currentMovingStop / 2, colorMidStop);
        gradient.addColorStop(currentMovingStop, colorStop);

        // advance the moving target
        currentMovingStop += movingStopIncrement;
        if (currentMovingStop >= maxMovingStop ||
            currentMovingStop <= minMovingStop) {
            movingStopIncrement = -movingStopIncrement;
            if (movingStopIncrement > 0) nextColor();
        }

        // all ready to draw the context:
        // setting gradient as fill style
        context.fillStyle = gradient;
        // outputting the gradient
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }

    return {
        "render": renderFrame
    }
})();