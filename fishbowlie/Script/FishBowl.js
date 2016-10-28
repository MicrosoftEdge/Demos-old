function FishBowl() {

    this.canvas;
    this.context;

    this.displayFish = true;
    this.displayBowlMask = true;
    this.displayBowlBack = true;
    this.displayBowlFront = true;
    this.displayBowlShine = true;
    this.displayBowlShadow = true;
    this.displayEdges = false;

    this.fishBowlWidth = 0;
    this.fishBowlHeight = 0;
    this.fishBowlScale = 1;
    this.fishBowlSpeed = 1;
    this.fishBowlMaxX;
    this.fishBowlMaxY;
    this.centerX = 100;
    this.centerY = 100;
    this.shadowHeight = 0;

    this.autoMode = true;
    this.checkFrameCount = 0;
    this.checkFrequency = 4;
    this.numberToAdjust = 3;

    this.upperHOffsets = new Array(0.02, 0.015, 0.012, 0.02, 0.028, 0.041, 0.068, 0.096, 0.135, 0.18, 0.25);
    this.lowerHOffsets = new Array(0.02, 0.05, 0.07, 0.10, 0.144, 0.18, 0.24, 0.32, 0.40, 0.51, 0.63, 0.63);
    this.upperVOffsets = new Array(0.00, 0.002, 0.0031, 0.0035, 0.0038, 0.0041, 0.0044, 0.0048, 0.021, 0.041, 0.085);
    this.lowerVOffsets = new Array(0.006, 0.006, 0.006, 0.006, 0.024, 0.08, 0.18, 0.30, 0.43, 0.66, 0.999, 1);

    this.fish = new Array();

    this.Initialize();

    this.Resize = function () {
        this.fishBowlWidth = sceneWidth - marginLeft - marginRight;
        this.fishBowlHeight = sceneHeight - marginTop - marginBottom;
        this.shadowHeight = this.fishBowlHeight * (150 / 1800);
        this.canvas.style.top = marginTop + "px";
        this.canvas.style.left = marginLeft + "px";
        this.canvas.setAttribute("width", this.fishBowlWidth);
        this.canvas.setAttribute("height", this.fishBowlHeight);
        this.centerX = (this.fishBowlWidth / 2);
        this.centerY = (this.fishBowlHeight / 2) + (this.fishBowlHeight * 0.062);
        this.fishBowlMaxX = (this.fishBowlWidth / 2) * 0.93;
        this.fishBowlMaxY = this.fishBowlHeight * 0.78 / 2;
        this.fishBowlScale = this.fishBowlWidth / 800;

        if (this.autoMode == true) {
            this.SetFishCount("Auto");
        }
        else {
            this.SetFishCount(this.fish.length);
        }
    }

    this.Draw = function () {
        this.context.clearRect(0, 0, this.fishBowlWidth, this.fishBowlHeight);
        if (this.displayBowlMask === true) {
            this.context.globalAlpha = 0.99975114;
            this.context.drawImage(imgMask, 0, 0, this.fishBowlWidth, this.fishBowlHeight);
        }

        if (this.displayBowlShadow === true) {
            this.context.save();
            this.context.globalCompositeOperation = 'source-atop';
            this.context.drawImage(imgBowlShadow, 0, (this.fishBowlHeight - this.shadowHeight), this.fishBowlWidth, this.shadowHeight);
            this.context.restore();
        }

        if (this.displayBowlBack === true) {
            this.context.globalAlpha = 0.48751414;
            this.context.drawImage(imgBowl, 0, 0, this.fishBowlWidth, this.fishBowlHeight);
        }

        if (this.displayFish === true) {
            var fish = null;
            for (var i = 0; fish = this.fish[i]; i++) {
                fish.Draw();
            }
        }

        if (this.displayBowlFront === true) {
            this.context.globalAlpha = 0.99843148;
            this.context.drawImage(imgBowlShine, 0, 0, this.fishBowlWidth, this.fishBowlHeight);
        }

        if (this.displayBowlShine === true) {
            this.context.globalAlpha = .82181426;
            this.context.save();
            this.context.globalCompositeOperation = 'lighter';
            this.context.drawImage(imgBowlGlowMask, this.fishBowlWidth * 0.5, this.fishBowlHeight * 0.12, this.fishBowlWidth * 0.5, this.fishBowlHeight * 0.42);
            this.context.restore();
            this.context.drawImage(imgBowlGlow, this.fishBowlWidth * 0.5, this.fishBowlHeight * 0.12, this.fishBowlWidth * 0.5, this.fishBowlHeight * 0.42);
        }

        if (this.displayEdges) {
            this.DrawEdges();
        }

        if (this.autoMode == true && (this.checkFrameCount > this.checkFrequency)) {
            if (performance.rollingAverageDrawTime < SINGLE_CYCLE) {
                this.AutoAddFish();
            }
            else {
                this.AutoRemoveFish();
            }
            this.checkFrameCount = 0;
        }
        this.checkFrameCount++;


    }

    this.DrawEdges = function () {
        this.context.globalAlpha = 1;

        this.context.fillStyle = "rgb(0,0,0)";
        this.context.fillRect(this.centerX - 2, this.centerY - 4, 8, 8);

        this.context.fillStyle = "rgb(255,255,0)";
        for (var i = 0; i < this.lowerHOffsets.length; i++) {
            this.context.fillRect(((1 - this.lowerHOffsets[i]) * this.fishBowlMaxX) + this.centerX, (this.fishBowlMaxY * i / 10) + this.centerY, 2, 2);
            this.context.fillRect(this.centerX - ((1 - this.lowerHOffsets[i]) * this.fishBowlMaxX), (this.fishBowlMaxY * i / 10) + this.centerY, 2, 2);
            this.context.fillRect(((1 - this.upperHOffsets[i]) * this.fishBowlMaxX) + this.centerX, this.centerY - (this.fishBowlMaxY * i / 10), 2, 2);
            this.context.fillRect(this.centerX - ((1 - this.upperHOffsets[i]) * this.fishBowlMaxX), this.centerY - (this.fishBowlMaxY * i / 10), 2, 2);
        }

        this.context.fillStyle = "rgb(255,0,0)";
        for (var i = 0; i < this.lowerVOffsets.length; i++) {
            this.context.fillRect((this.fishBowlMaxX * i / 10) + this.centerX, this.centerY + ((1 - this.lowerVOffsets[i]) * this.fishBowlMaxY), 2, 2);
            this.context.fillRect(this.centerX - (this.fishBowlMaxX * i / 10), this.centerY + ((1 - this.lowerVOffsets[i]) * this.fishBowlMaxY), 2, 2);
            this.context.fillRect((this.fishBowlMaxX * i / 10) + this.centerX, this.centerY - ((1 - this.upperVOffsets[i]) * this.fishBowlMaxY), 2, 2);
            this.context.fillRect(this.centerX - (this.fishBowlMaxX * i / 10), this.centerY - ((1 - this.upperVOffsets[i]) * this.fishBowlMaxY), 2, 2);
        }
    }

    this.ShowFish = function () {
        this.displayFish = true;
        document.getElementById("chkFish").setAttribute("class", "Control Enabled");
    }

    this.HideFish = function () {
        this.displayFish = false;
        document.getElementById("chkFish").setAttribute("class", "Control Disabled");
    }

    this.ToggleFishVisibility = function () {
        if (this.displayFish === true) {
            this.HideFish();
        }
        else {
            this.ShowFish();
        }
    }

    this.ShowBowlMask = function () {
        this.displayBowlMask = true;
        document.getElementById("chkBowlMask").setAttribute("class", "Control Enabled");
    }

    this.HideBowlMask = function () {
        this.displayBowlMask = false;
        document.getElementById("chkBowlMask").setAttribute("class", "Control Disabled");
    }

    this.ToggleBowlMaskVisibility = function () {
        if (this.displayBowlMask === true) {
            this.HideBowlMask();
        }
        else {
            this.ShowBowlMask();
        }
    }

    this.ShowBowlBack = function () {
        this.displayBowlBack = true;
        document.getElementById("chkBowlBack").setAttribute("class", "Control Enabled");
    }

    this.HideBowlBack = function () {
        this.displayBowlBack = false;
        document.getElementById("chkBowlBack").setAttribute("class", "Control Disabled");
    }

    this.ToggleBowlBackVisibility = function () {
        if (this.displayBowlBack === true) {
            this.HideBowlBack();
        }
        else {
            this.ShowBowlBack();
        }
    }

    this.ShowBowlFront = function () {
        this.displayBowlFront = true;
        document.getElementById("chkBowlFront").setAttribute("class", "Control Enabled");
    }

    this.HideBowlFront = function () {
        this.displayBowlFront = false;
        document.getElementById("chkBowlFront").setAttribute("class", "Control Disabled");
    }

    this.ToggleBowlFrontVisibility = function () {
        if (this.displayBowlFront === true) {
            this.HideBowlFront();
        }
        else {
            this.ShowBowlFront();
        }
    }

    this.ShowBowlShine = function () {
        this.displayBowlShine = true;
        document.getElementById("chkBowlShine").setAttribute("class", "Control Enabled");
    }

    this.HideBowlShine = function () {
        this.displayBowlShine = false;
        document.getElementById("chkBowlShine").setAttribute("class", "Control Disabled");
    }

    this.ToggleBowlShineVisibility = function () {
        if (this.displayBowlShine === true) {
            this.HideBowlShine();
        }
        else {
            this.ShowBowlShine();
        }
    }

    this.ShowBowlShadow = function () {
        this.displayBowlShadow = true;
        document.getElementById("chkBowlShadow").setAttribute("class", "Control Enabled");
    }

    this.HideBowlShadow = function () {
        this.displayBowlShadow = false;
        document.getElementById("chkBowlShadow").setAttribute("class", "Control Disabled");
    }

    this.ToggleBowlShadowVisibility = function () {
        if (this.displayBowlShadow === true) {
            this.HideBowlShadow();
        }
        else {
            this.ShowBowlShadow();
        }
    }

    this.ShowEdges = function () {
        this.displayEdges = true;
    }

    this.HideEdges = function () {
        this.displayEdges = false;
    }

    this.ToggleBowlEdges = function () {
        this.displayEdges = (this.displayEdges === true) ? false : true;
    }
}


FishBowl.prototype.Initialize = function () {
    this.canvas = document.getElementById("FishBowlCanvas");
    this.context = this.canvas.getContext("2d");
    // jweberTBD document.getElementById("FishCount").value = "10";
};


FishBowl.prototype.AddFish = function (type) {

    if (type == true) {
        var f = new Fish();
        f.InitializeFixed();
        this.fish.push(f);
    }
    else {
        var f = new Fish();
        f.InitializeRandom();
        this.fish.push(f);
    }

    this.SetAudio();
};


FishBowl.prototype.RemoveFish = function () {
    this.fish.pop();
    this.SetAudio();
};


FishBowl.prototype.SetFishCount = function (count) {

    this.fish = new Array();
    this.checkFrequency = 4;
    this.numberToAdjust = 3;

    if (count == "Auto") {
        this.autoMode = true;
        this.AddFish(true);
    }
    else {
        if (this.fish.length == 0) {
            this.AddFish(true);
        }
        this.autoMode = false;
        for (i = 0; i < count - 1; i++) {
            this.AddFish(false);
        }
    }

    document.getElementById("currentMenuItem").innerHTML = count;
};


FishBowl.prototype.SetAudio = function () {
    var volume = this.fish.length / 2000 * fishBowl.fishBowlSpeed;
    if (volume < 0.05) { volume = 0.05 };
    if (volume > 0.75) { volume = 0.75 };
    water.waterAudio.volume = volume;
};


FishBowl.prototype.AutoAddFish = function () {
    for (var i = 1; i <= this.numberToAdjust; i++) {
        this.AddFish(false);
    }
};


FishBowl.prototype.AutoRemoveFish = function () {
    this.numberToAdjust = 3;
    this.numberToAdjust = (this.numberToAdjust < 1) ? 1 : this.numberToAdjust;

    for (var i = 1; i < this.numberToAdjust; i++) {
        if (this.fish.length > 1) {
            this.RemoveFish();
        }
    }
    this.checkFrequency = (this.checkFrequency * 1.03 > 30) ? 30 : this.checkFrequency * 1.03;
};