function Snowstorm() {

    this.performance;

    this.canvas;
    this.context;

    this.raf;
    this.callback;
    this.calculateScore = true;
    this.currentScore = 0;
    this.countRAFs;
    this.countCallbacks = 0;
    this.measureCallbacks = true;

    this.adjustSnowflakeCount = true;
    this.checkFrameCount = 0;
    this.checkFrequency = 4;
    this.numberToAdjust = 3;

    this.snowflakes = new Array();
    this.countSnowflakes = 0;
    this.maxCountSnowflakes = 0;
    this.windSpeed = 0;
    this.windFactor = 0;

    this.Initialize();

    this.BeginSpinDown = function () {
        this.adjustSnowflakeCount = false;
        this.measureCallbacks = false;
        this.calculateScore = false;
    }

    this.Draw = function () {

        this.performance.BeginDrawLoop();
        this.countRAFs++;
        this.context.clearRect(0, 0, sceneWidth, sceneHeight);
        this.context.textAlign = "center";
        this.context.font = "34pt Cookies";
        this.context.fillText(this.currentScore, 110, sceneHeight - 50);
        this.context.font = "14pt Cookies";
        this.context.fillText("PenguinMark Score", 110, sceneHeight - 22);
        var measures = "Snow:" + this.countSnowflakes + " Peak:" + this.maxCountSnowflakes + " Calls:" + this.countCallbacks;
        this.context.font = "7pt Cookies";
        this.context.fillText(measures, 110, sceneHeight - 8);

        var snowflake = null;
        for (var i = 1; snowflake = this.snowflakes[i]; i++) {
            snowflake.Move();
            snowflake.Draw(this.context);
        }

        this.windSpeed = this.countSnowflakes / 1000;

        if (this.adjustSnowflakeCount == true) {
            if (this.checkFrameCount > this.checkFrequency) {
                if (this.performance.rollingAverage < (1000 / 60)) {
                    this.IncreaseSnowflakes();
                }
                else {
                    this.DecreaseSnowflakes();
                }
                this.checkFrameCount = 0;
            }
        }
        else {
            this.RemoveSnowflakes(Math.max((this.countSnowflakes * 0.01), 1));
            if (this.countSnowflakes < 6) {
                this.Stop();
            }
        }
        this.checkFrameCount++;

        if (this.calculateScore == true) {
            if (this.countSnowflakes > this.maxCountSnowflakes) {
                this.maxCountSnowflakes = this.countSnowflakes;
            }
            this.currentScore = Math.round(this.maxCountSnowflakes * this.windFactor);
        }

        this.RequestAnimFrame();
        this.performance.FinishDrawLoop();
    }

    this.HandleCallback = function () {
        this.countCallbacks++;
        this.windFactor = this.countCallbacks / 100000;
        if (this.measureCallbacks == true) {
            this.RequestCallback();
        }
    }

    this.Resize = function () {
        this.Initialize();
        this.canvas.setAttribute("width", sceneWidth);
        this.canvas.setAttribute("height", sceneHeight);
    }

    this.RequestAnimFrame = function () {
        this.raf = requestAnimFrame(function () { snowstorm.Draw(); }, (1000 / 60));
    }

    this.RequestCallback = function () {
        this.callback = requestCallback(function () { snowstorm.HandleCallback(); } );
    }

    this.ScheduleSpinDown = function () {
        this.callback = setTimeout(function () { snowstorm.BeginSpinDown(); }, 44000 );
    }

    this.ShowEntry = function () {
        this.RequestAnimFrame();
    }

    this.Start = function () {
        this.RequestAnimFrame();
        this.RequestCallback();
        this.ScheduleSpinDown();
    }

    this.Stop = function () {
        cancelAnimFrame(this.raf);
        this.context.clearRect(0, 0, sceneWidth, sceneHeight);
        ShowResults();
    }
}


Snowstorm.prototype.Initialize = function () {
    this.performance = new Performance();
    this.canvas = document.getElementById("SnowstormCanvas");
    this.context = this.canvas.getContext("2d");
    this.context.textAlign = "center";
    this.IncreaseSnowflakes();
};


Snowstorm.prototype.IncreaseSnowflakes = function () {
    for (var i = 1; i <= this.numberToAdjust; i++) {
        this.snowflakes.push(new Snowflake());
        this.countSnowflakes++;
    }
    for (var i = 1; snowflake = this.snowflakes[i]; i++) {
        snowflake.snowstorm = this;
    }
    if (this.performance.rollingAverage < 14 && this.numberToAdjust < 37) {
        this.numberToAdjust = this.numberToAdjust * 1.03;
    }
};


Snowstorm.prototype.DecreaseSnowflakes = function () {
    this.numberToAdjust = this.numberToAdjust * .95;
    this.numberToAdjust = (this.numberToAdjust < 1) ? 1 : this.numberToAdjust;
    this.numberToAdjust = ((this.numberToAdjust * 2) > this.countSnowflakes) ? (this.numberToAdjust / 3) : this.numberToAdjust;
    this.numberToAdjust = (this.countSnowflakes < 2) ? 0 : this.numberToAdjust;
    this.RemoveSnowflakes(this.numberToAdjust);
    this.checkFrequency = (this.checkFrequency * 1.03 > 30) ? 30 : this.checkFrequency * 1.03;
};


Snowstorm.prototype.RemoveSnowflakes = function (count) {
    for (var i = 1; i <= count; i++) {
        this.snowflakes.pop();
        this.countSnowflakes--;
    }
};
