function Performance() {

    this.browserCheck;
    this.browserName;
    this.browserVersion;
    this.startTime;
    this.drawCount = 0;
    this.startDrawingTime;
    this.stopDrawTime = 0;
    this.previousStopDrawTime = 0;
    this.currentDrawTime = 0;
    this.debugText = "";
    this.delta = 0;
    this.rollingAverage = "";
    this.rollingAverageCounter = 0;
    this.rollingAverageSum = 0;

    this.Initialize();

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
            this.rollingAverage = Math.floor(this.rollingAverageSum / this.rollingAverageCounter);
            this.rollingAverageCounter = 0;
            this.rollingAverageSum = 0;
        }
    }

}


Performance.prototype.Initialize = function () {
    this.startTime = new Date();
};