

/* ---------------------------------------------------------------- Performance Class --- */

function Performance() {

    this.browserCheck;
    this.browserName;
    this.browserVersion;
    this.browserTimerResolution;

    this.startTime;

    this.nextFPS = 0;
    this.currentSecond = 0;

    this.startDrawingTime;
    this.totalDrawTime = 0;
    this.currentDrawTime = 0;
    this.drawCount = 0;
    this.averageDrawTime = 0;
    this.animationSteps = 0;

    this.testStartTime;
    this.testDuration;
    this.testRunning;
    this.testStarted = false;

    this.debugText = "";



    // Initialize the Class
    this.Initialize = function () {

        this.startTime = new Date();
        this.GetBrowserInformation();

    }



    this.BeginDrawLoop = function () {
        this.startDrawingTime = new Date();
    }



    this.FinishDrawLoop = function () {
        var now = new Date();
        this.currentDrawTime = now.valueOf() - this.startDrawingTime.valueOf();
        this.totalDrawTime += this.currentDrawTime;
        this.drawCount++;
        this.averageDrawTime = Math.floor(this.totalDrawTime / this.drawCount);

        // If we can display a frame in under 40ms play the repeat sound, otherwise we end up with hundreds 
        // of sounds playing at once which sounds like a solid record scratch.
        if (this.currentDrawTime < 40) {
            repeatSound = true;
        }
        //repeatSound = true;
    }



    this.StartWarmupSequence = function () {
        this.totalDrawTime = 0;
        this.currentDrawTime = 0;
        this.drawCount = 0;
        this.averageDrawTime = 0;
        this.animationSteps = 0;
    }



    this.StopWarmupSequence = function () {

        this.averageDrawTime = Math.floor(this.totalDrawTime / this.drawCount);

        // If the drawing can occur faster than the draw loop is called back it means that the browser is capable 
        // of flipping the graphics even faster. This function determines how additional processing could actually 
        // occur and we use that unused CPU time to flip additional characters. Because we end up drawing multiple
        // characters in a single frame (60hz for most LCD's which equates to 16.7ms) we call this compositing.
        // On a Dell Precision workstation with a 3Ghz processor and NVIDIA graphics 39% of the CPU time is 
        // spent in display (which only needs to happen once per interval) and 61% in other subsystems. Each 
        // billboard draw (the billboard and characters) takes 6% of that 'other' CPU time. These numbers will vary 
        // slightly based on machine configuration but this is an objective baseline for the demo.
        //
        // On an I7 with an ATI HD 5800 series IE9 can compose the entire alphabet multiple times. That doesn't 
        // make for a compelling animation so we'll throttle that scenario later in the code. I bet you never 
        // thought you would see the day where Internet Explorer was so fast that we actually have to *slow* 
        // the browser down!
        //
        // Press "D" for debug mode and it will show you the draw time and animation steps for each loop on your
        // machine. Please note that for some low end machines, especially those with slow CPU's and DirectX9 hardware
        // Internet Explorer will take longer than a SINGLE_CYCLE to draw the animation so there will not be any
        // additional CPU time to flip the image additional times. In those situations the compositing is disabled.
        //
        // For more information on how to calculate how much CPU and GPU time IE9 requires on your own machine 
        // we recomend reading the following blog post:
        // http://blogs.msdn.com/b/ie/archive/2010/06/21/measuring-browser-performance-with-the-windows-performance-tools.aspx
        //
        // This approach applies to all browsers (harware accelerated or note) and works well to take advantage 
        // of the unused CPU time. Firefox 4 with hardware acceleration appears to be much less efficent
        // so using this algorithm benefits them. But you would be suspicious if we used a different algorithm
        // for each browser, so we'll use the same algorithm for everyone.

        // If we can draw faster than a SINGLE_CYCLE determine how much more we can draw otherwise stick with 1 draw per loop.
        if (this.averageDrawTime < SINGLE_CYCLE) {
            // On the Dell Precision the math works out like this:
            //                    ((   16.666ms  - (       6.312ms       * 0.39)) / (       6.312ms       * 0.61)) / 0.06
            this.animationSteps = ((SINGLE_CYCLE - (this.averageDrawTime * 0.39)) / (this.averageDrawTime * 0.61)) / 0.06;
            composite = true;
        }
        else {
            this.animationSteps = 1;
            composite = false;
        }

    }



    this.StartTest = function () {
        this.testStarted = true;
        this.testRunning = true;
        this.testStartTime = new Date();
    }



    this.StopTest = function () {
        this.testRunning = false;
        var now = new Date();
        this.testDuration = now.valueOf() - this.testStartTime.valueOf();
    }



    this.Draw = function () {

        var fps = Math.floor((1000 / this.averageDrawTime));
        // Account for clock skew which can be up to two frames (33.33ms) when hardware accelerated.
        fps = (fps > 57) ? 60 : fps;

        surface.fillStyle = '#FFFFFF';
        surface.font = "bold 13pt Verdana";
        surface.fillText("How fast can your browser speed read?", 50, surfaceHeight - 40);
        surface.font = "9pt Verdana";

        var message = "";

        message += "Using " + this.browserName + " " + this.browserVersion;

        message += "    FPS:" + fps;

        message += "    Total Billboard Draws:" + this.drawCount;

        var average = (this.averageDrawTime < 10) ? "0" + this.averageDrawTime : this.averageDrawTime;
        message += "    Average Draw Duration:" + average + "ms";

        var current = (this.currentDrawTime < 10) ? "0" + this.currentDrawTime : this.currentDrawTime;
        message += "    Last Draw Duration:" + current + "ms";

        if (this.testStarted === true) {

            if (debug == true) {
                message += "  AnimationSteps:" + Math.floor(this.animationSteps);
                message += "  CharactersToStep:" + Math.floor((perf.animationSteps / billboard.Tiles[0].countAnimationSteps));
            }
        }

        message += "    Window Size:" + surfaceWidth + "x" + surfaceHeight;

        if (window.navigator.msPointerEnabled) {
            message += "    Touch Enabled";
        }

        if (debug == true) {
            message += "    Debug:" + this.debugText;
        }

        surface.fillText(message, 50, surfaceHeight - 20);
    }



    this.GetBrowserInformation = function () {

        var UA = navigator.userAgent.toLowerCase();
        var index;

        if (document.documentMode) {
            index = UA.indexOf('msie');
            this.browserCheck = "IE";
            this.browserName = "Internet Explorer";
            this.browserVersion = "" + document.documentMode;
            this.browserTimerResolution = 16.7;
        }
        else if (UA.indexOf('edge') > -1) {
            index = UA.indexOf('edge');
            this.browserCheck = "Edge";
            this.browserName = "Microsoft Edge";
            this.browserVersion = "(EdgeHTML " + parseFloat('' + UA.substring(index + 5)) + ")";
        }
        else if (UA.indexOf('chrome') > -1) {
            index = UA.indexOf('chrome');
            this.browserCheck = "Chrome";
            this.browserName = "Google Chrome";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 7));
            this.browserTimerResolution = 4;
        }
        else if (UA.indexOf('firefox') > -1) {
            index = UA.indexOf('firefox');
            this.browserCheck = "Firefox";
            this.browserName = "Mozilla Firefox";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 8));
            this.browserTimerResolution = 10;
        }
        else if (UA.indexOf('minefield') > -1) {
            index = UA.indexOf('minefield');
            this.browserCheck = "Firefox";
            this.browserName = "Mozilla Firefox Minefield";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 10));
            this.browserTimerResolution = 10;
        }
        else if (UA.indexOf('opera') > -1) {
            this.browserCheck = "Opera";
            this.browserName = "Opera";
            this.browserVersion = "";
            this.browserTimerResolution = 4;
        }
        else if (UA.indexOf('safari') > -1) {
            index = UA.indexOf('safari');
            this.browserCheck = "Safari";
            this.browserName = "Apple Safari";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 7));
            this.browserTimerResolution = 10;
        }
    }


}