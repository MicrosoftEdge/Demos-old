function Performance() {

    // Browser Information
    this.browserCheck;
    this.browserName;
    this.browserVersion;
    this.browserTransform;

    // Performance Dashboard
    this.canvas;
    this.context;
    this.displayDashboard = false;

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
        this.canvas.setAttribute("width", 1000);
        this.canvas.setAttribute("height", 32);
        this.canvas.style.top = (sceneHeight - 32) + "px";
    }

    this.BeginTrending = function () {
        this.previousStopDrawTime = new Date();
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
        if (this.rollingAverageCounter == 32) {
            this.rollingAverageDrawTime = this.rollingAverageSum / this.rollingAverageCounter;
            this.rollingAverageCounter = 0;
            this.rollingAverageSum = 0;
            this.rollingAveragePercent = Math.min((1000 / this.rollingAverageDrawTime / 60), 1);
            fishBowl.fishBowlSpeed = this.rollingAveragePercent;

            // Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
            // and other variables which could destabalize the number. This keeps the number more
            // stable once we've reached the equilibrium.
            this.rollingAverageFPS = Math.min(1000 / this.rollingAverageDrawTime, 60);
            this.rollingAverageFPS = (this.rollingAverageFPS < (60 * 0.95)) ? this.rollingAverageFPS : 60;
            fpsMeter.fpsMeterTargetValue = this.rollingAverageFPS;
        }
    }

    this.DrawDashboard = function () {
        this.context.clearRect(0, 0, sceneWidth, sceneHeight - 32);

        if (this.displayDashboard === true) {

            var message = "";
            message += "     Using " + this.browserName + " " + this.browserVersion;
            message += "     Window Size: " + sceneWidth + "x" + sceneHeight;

            // Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
            // and other variables which could destabalize the number. This keeps the number more
            // stable once we've reached the equilibrium.
            if (this.rollingAverageDrawTime > 15.865 && this.rollingAverageDrawTime < 17.535) {
                message += "     DrawTime: 16.7ms";
                message += "     FPS: 60";
                message += "     Percent: 100%";
            }
            else {
                message += "     DrawTime: " + Math.floor(this.rollingAverageDrawTime) + "ms";
                message += "     FPS: " + Math.min(Math.floor(this.rollingAverageFPS), 60);
                message += "     Percent: " + Math.round(this.rollingAveragePercent * 100) + "%";
            }

            if (DEBUG == true) {
                message += "     Debug: " + this.debugText;
            }

            this.context.fillStyle = '#b4b4b4';
            this.context.font = "9pt Verdana";
            this.context.textAlign = "center";
            this.context.fillText(message, ((sceneWidth + marginLeft - marginRight) / 2), 18);

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

        var UA = navigator.userAgent.toLowerCase();
        var index;

        if (document.documentMode) {
            index = UA.indexOf('msie');
            this.browserCheck = "IE";
            this.browserName = "Internet Explorer";
            this.browserVersion = "" + document.documentMode;
            this.browserTransform = "msTransform";
        }
        else if (UA.indexOf('chrome') > -1) {
            index = UA.indexOf('chrome');
            this.browserCheck = "Chrome";
            this.browserName = "Google Chrome";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 7));
            this.browserTransform = "WebkitTransform";
        }
        else if (UA.indexOf('firefox') > -1) {
            index = UA.indexOf('firefox');
            this.browserCheck = "Firefox";
            this.browserName = "Mozilla Firefox";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 8));
            this.browserTransform = "MozTransform";
        }
        else if (UA.indexOf('minefield') > -1) {
            index = UA.indexOf('minefield');
            this.browserCheck = "Firefox";
            this.browserName = "Mozilla Firefox Minefield";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 10));
            this.browserTransform = "MozTransform";
        }
        else if (UA.indexOf('opera') > -1) {
            this.browserCheck = "Opera";
            this.browserName = "Opera";
            this.browserVersion = "";
            this.browserTransform = "OTransform";
        }
        else if (UA.indexOf('safari') > -1) {
            index = UA.indexOf('safari');
            this.browserCheck = "Safari";
            this.browserName = "Apple Safari";
            this.browserVersion = "" + parseFloat('' + UA.substring(index + 7));
            this.browserTransform = "WebkitTransform";
        }
    }

    this.Initialize();
}
