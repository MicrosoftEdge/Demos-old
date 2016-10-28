function Snowflake() {

    this.currentX = 0.5;
    this.currentY = 1;
    this.currentWidth = 10;
    this.currentHeight = 10;
    this.currentAlpha = 1;
    this.snowflakeIndex = 1;
    this.fallingRate = 1;
    this.flutter = 0;
    this.snowstorm = null;

    this.Initialize();

    this.Draw = function () {
        this.snowstorm.context.save();
        this.snowstorm.context.globalAlpha = this.currentAlpha;
        this.snowstorm.context.drawImage(imgSnowflake, (20 * this.snowflakeIndex), 0, 20, 20, this.currentX, this.currentY, this.currentWidth, this.currentHeight);
        this.snowstorm.context.restore();
    }
}


Snowflake.prototype.Initialize = function () {
    this.currentX = (Math.random() * sceneWidth * 1.3) - (sceneWidth * .3);
    this.currentY = Math.random() * sceneHeight * -1;
    this.currentWidth = Math.random() * 22;
    this.currentHeight = this.currentWidth;
    this.currentAlpha = (Math.random() * 0.3) + 0.7;
    this.snowflakeIndex = Math.ceil(Math.random() * 4);
    this.fallingRate = Math.random();
    this.flutter = Math.random() * .1;
};


Snowflake.prototype.Move = function () {
    this.currentX = this.currentX + (this.flutter + (this.snowstorm.windSpeed / 3)) / (10000 / this.snowstorm.countCallbacks);
    this.currentY = this.currentY + ((this.fallingRate + this.snowstorm.windSpeed) / (10000 / this.snowstorm.countCallbacks));

    if (this.currentY > sceneHeight) {
        this.Initialize();
    }
};