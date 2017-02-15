// This file contains the performance type which uses requestAnimationFrame to measure
// the callbacks per second and determine the FPS of the demo.

var performance = new Performance();
performance.Initialize();
performance.Resize();

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback) {
                  window.setTimeout(callback, 16.7);
              };
})();

function UpdateFPS() {
    performance.BeginDrawLoop();
    performance.DrawDashboard();
    performance.FinishDrawLoop();
    requestAnimFrame(UpdateFPS);
}
UpdateFPS();

function Performance() {

    // Browser Information
    this.browserCheck;
    this.browserName;
    this.browserVersion;
    this.browserOS;
    this.browserTransform;

    // Performance Dashboard
    this.canvas;
    this.context;
    this.sceneWidth;
    this.sceneHeight;
    this.displayDashboard = true;

    // Runtime Performance Information
    this.startTime;
    this.drawCount = 0;
    this.startDrawingTime;
    this.stopDrawTime = 0;
    this.previousStopDrawTime = 0;
    this.currentDrawTime = 0;
    this.delta = 0;
    this.rollingAverageDrawTime = "";
    this.rollingAverageCounter = 0;
    this.rollingAverageSum = 0;
    this.rollingAverageFPS = 0;
    this.rollingAveragePercent = 0;

    // Debug Information
    this.debugText = "";

    this.Initialize = function () {
        this.startTime = new Date();
        this.GetBrowserInformation();
        this.canvas = document.getElementById("PerformanceCanvas");
        this.context = this.canvas.getContext("2d");
    }

    this.Resize = function () {
        this.sceneWidth = 1000;
        this.sceneHeight = document.body.offsetHeight;
    }

    this.BeginTrending = function () {
        this.previousStopDrawTime = new Date();
    }

    this.ResetTrending = function () {
    }

    this.BeginDrawLoop = function () {
        this.startDrawingTime = new Date();
    }

    this.FinishDrawLoop = function () {
        var now = new Date();
        this.stopDrawTime = now.valueOf();
        this.currentDrawTime = this.stopDrawTime - this.startDrawingTime.valueOf();
        this.delta = Math.floor(this.stopDrawTime - this.previousStopDrawTime - 17);
        if (this.delta > 0) {
            this.currentDrawTime += this.delta;
        }
        this.previousStopDrawTime = this.stopDrawTime;
        this.drawCount++;

        this.rollingAverageCounter++;
        this.rollingAverageSum += this.currentDrawTime;
        if (this.rollingAverageCounter == 10) {
            this.rollingAverageDrawTime = this.rollingAverageSum / this.rollingAverageCounter;
            this.rollingAverageCounter = 0;
            this.rollingAverageSum = 0;
            this.rollingAveragePercent = Math.min((1000 / this.rollingAverageDrawTime / 60), 1);

            // Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
            // and other variables which could destabalize the number. This keeps the number more
            // stable once we've reached the equilibrium.
            this.rollingAverageFPS = Math.min(1000 / this.rollingAverageDrawTime, 60);
            this.rollingAverageFPS = (this.rollingAverageFPS < (60 * 0.95)) ? this.rollingAverageFPS : 60;
        }
    }

    this.DrawDashboard = function () {
        this.context.clearRect(0, 0, this.sceneWidth, this.sceneHeight - 32);

        if (this.displayDashboard === true) {

            var message = "";
            message += "Using " + this.browserName + " " + this.browserVersion + " on " + this.browserOS;
            message += "     Window Size: " + this.sceneWidth + "x" + this.sceneHeight;

            // Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
            // and other variables which could destabalize the number. This keeps the number more
            // stable once we've reached the equilibrium.
            if (this.rollingAverageDrawTime > 15.865 && this.rollingAverageDrawTime < 17.535) {
                message += "     DrawCount: " + Math.floor(this.drawCount);
                message += "     FPS: " + Math.round(this.rollingAverageFPS) + "fps";
                message += "     Percent: 100%";
                message += "     DrawTime: 16.7ms";
            }
            else {
                message += "     DrawCount: " + Math.floor(this.drawCount);
                message += "     FPS: " + Math.round(this.rollingAverageFPS) + "fps";
                message += "     Percent: " + Math.round(this.rollingAveragePercent * 100) + "%";
                message += "     DrawTime: " + Math.floor(this.rollingAverageDrawTime) + "ms";
            }

            this.context.fillStyle = '#0e4a51';
            this.context.font = "8pt Verdana";
            //this.context.textAlign = "right";
            this.context.fillText(message, 18, 18);
        }
    }

    this.Show = function () {
        this.displayDashboard = true;
    }

    this.Hide = function () {
        this.displayDashboard = false;
    }

    this.ToggleVisibility = function () {
        this.displayDashboard = (this.displayDashboard === true) ? false : true;
    }

    this.GetBrowserInformation = function () {

        this.browserName = "Unknown Browser";
        this.browserVersion = "";
        this.browserOS = "Unknown Operating System";
        this.browserTransform = "";

        var userAgent = navigator.userAgent.toLowerCase();
        var index;

        if (document.documentMode) {
            index = userAgent.indexOf('msie');
            this.browserCheck = "IE";
            this.browserName = "Internet Explorer";
            this.browserVersion = "" + document.documentMode;
            this.browserTransform = "msTransform";
        }
        else if (userAgent.indexOf('edge') > -1) {
            index = userAgent.indexOf('edge');
            this.browserCheck = "Edge";
            this.browserName = "Microsoft Edge";
            this.browserVersion = "(EdgeHTML " + parseFloat('' + userAgent.substring(index + 5)) + ")";
            this.browserTransform = "transform";
        }
        else if (userAgent.indexOf('chrome') > -1) {
            index = userAgent.indexOf('chrome');
            this.browserCheck = "Chrome";
            this.browserName = "Google Chrome";
            this.browserVersion = "" + parseFloat('' + userAgent.substring(index + 7));
            this.browserTransform = "WebkitTransform";
        }
        else if (userAgent.indexOf('firefox') > -1) {
            index = userAgent.indexOf('firefox');
            this.browserCheck = "Firefox";
            this.browserName = "Mozilla Firefox";
            this.browserVersion = "" + parseFloat('' + userAgent.substring(index + 8));
            this.browserTransform = "MozTransform";
        }
        else if (userAgent.indexOf('minefield') > -1) {
            index = userAgent.indexOf('minefield');
            this.browserCheck = "Firefox";
            this.browserName = "Mozilla Firefox Minefield";
            this.browserVersion = "" + parseFloat('' + userAgent.substring(index + 10));
            this.browserTransform = "MozTransform";
        }
        else if (userAgent.indexOf('opera') > -1) {
            this.browserCheck = "Opera";
            this.browserName = "Opera";
            this.browserVersion = "";
            this.browserTransform = "OTransform";
        }
        else if (userAgent.indexOf('safari') > -1) {
            index = userAgent.indexOf('safari');
            this.browserCheck = "Safari";
            this.browserName = "Apple Safari";
            this.browserVersion = "" + parseFloat('' + userAgent.substring(index + 7));
            this.browserTransform = "WebkitTransform";
        }


        var version = navigator.appVersion.toLowerCase();

        if (version.indexOf('win') > -1) {
            if (version.indexOf('nt 5.1') > -1) {
                this.browserOS = "Windows XP";
            }
            else if (version.indexOf('nt 5.2') > -1) {
                this.browserOS = "Windows Server";
            }
            else if (version.indexOf('nt 6.0') > -1) {
                this.browserOS = "Windows Vista";
            }
            else if (version.indexOf('nt 6.1') > -1) {
                this.browserOS = "Windows 7";
            }
            else if (version.indexOf('nt 6.2') > -1) {
                this.browserOS = "Windows 8";
            }
            else if (version.indexOf('nt 6.3') > -1) {
                this.browserOS = "Windows 8.1";
            }
			else if (version.indexOf('nt 10.0') > -1) {
                this.browserOS = "Windows 10";
            }
            else {
                this.browserOS = navigator.appVersion;
            }
        }
        else if (version.indexOf('mac') > -1) {
            this.browserOS = "Mac OS X";
        }
        else if (version.indexOf('unix') > -1) {
            this.browserOS = "UNIX";
        }
        else if (version.indexOf('linux') > -1) {
            this.browserOS = "Linux";
        }
        else {
            this.browserOS = navigator.appVersion;
        }
    }

    this.Initialize();
}
