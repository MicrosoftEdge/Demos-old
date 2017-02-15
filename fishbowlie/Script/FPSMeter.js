function FPSMeter() {

    this.canvas;
    this.context;
    this.displayFPSMeter = true;
    this.displayFPSNeedle = true;

    this.width = 163;
    this.height = 94;
    this.padding = 26;
    this.top = 202;
    this.left = 49;

    this.fpsNeedle;
    this.fpsMeterCurrentValue = 0;
    this.fpsMeterTargetValue = 0;
    this.fpsMeterMaxValue = 60;
    this.fpsMeterCurrentAngle = 0;
    this.fpsMaxAngle = 47;

    this.Resize = function () {
        if (this.displayFPSMeter == true) {
            this.canvas.style.top = this.top - this.padding + "px";
            this.canvas.style.left = this.left - this.padding + "px";
            this.canvas.setAttribute("width", this.width + (this.padding * 2));
            this.canvas.setAttribute("height", this.height + this.padding + 40);
            this.Draw();
        }
    }

    this.Draw = function () {

        if (this.fpsMeterCurrentValue > 20) {
            this.fpsMeterCurrentValue += (this.fpsMeterTargetValue - this.fpsMeterCurrentValue) * 0.03;
        }
        else {
            this.fpsMeterCurrentValue += (this.fpsMeterTargetValue - this.fpsMeterCurrentValue) * 0.5;
        }

        this.fpsMeterCurrentAngle = ((this.fpsMeterCurrentValue / this.fpsMeterMaxValue) * (this.fpsMaxAngle * 2)) - this.fpsMaxAngle;

        if (this.displayFPSMeter === true) {
            this.context.clearRect(0, 0, (this.width + (this.padding * 2)), this.height + this.padding + 40);
            this.context.drawImage(imgGauge, this.padding, this.padding, this.width, this.height);
            this.context.fillStyle = 'rgba(239,93,26,0.5)';
            this.context.font = "36pt Opificio";
            this.context.textAlign = "center";

            // Provide a 5% buffer around the 16.7ms rolling average to account for clock skew
            // and other variables which could destabalize the number. This keeps the number more
            // stable once we've reached the equilibrium.
            if (this.fpsMeterCurrentValue > 60 * 0.95) {
                this.context.fillText("60", (this.width / 2) + this.padding, (this.height * 0.68) + this.padding);
            }
            else {
                this.context.fillText(Math.floor(this.fpsMeterCurrentValue), (this.width / 2) + this.padding, (this.height * 0.68) + this.padding);
            }

            this.context.font = "12pt Opificio";
            this.context.fillText("fps", (this.width / 2) + this.padding, (this.height * 0.82) + this.padding);
            this.context.fillStyle = '#b4b4b4';
            this.context.font = "16pt Opificio";
            this.context.textAlign = "center";
            this.context.fillText(fishBowl.fish.length + " Fish", (this.width / 2) + this.padding, this.height + this.padding + 38);

            this.fpsNeedle.style[performance.browserTransform] = 'translate(0px, 50px)' + 'rotate(' + this.fpsMeterCurrentAngle + 'deg)' + 'translate(0px, -50px)';
        }
    }

    this.ShowMeter = function () {
        this.displayFPSMeter = true;
        document.getElementById("chkFPSMeter").setAttribute("class", "Control Enabled");
        this.Resize();
    }

    this.HideMeter = function () {
        this.displayFPSMeter = false;
        document.getElementById("chkFPSMeter").setAttribute("class", "Control Disabled");
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.setAttribute("width", 0);
        this.canvas.setAttribute("height", 0);
    }

    this.ToggleVisibility = function () {
        if (this.displayFPSMeter == true) {
            this.HideMeter();
        }
        else {
            this.ShowMeter();
        }
    }

    this.ShowNeedle = function () {
        this.displayFPSNeedle = true;
        document.getElementById("chkFPSNeedle").setAttribute("class", "Control Enabled");
        document.getElementById("FPSNeedle").style.visibility = "visible";
    }

    this.HideNeedle = function () {
        this.displayFPSNeedle = false;
        document.getElementById("chkFPSNeedle").setAttribute("class", "Control Disabled");
        document.getElementById("FPSNeedle").style.visibility = "hidden";
    }

    this.ToggleNeedleVisibility = function () {
        if (this.displayFPSNeedle == true) {
            this.HideNeedle();
        }
        else {
            this.ShowNeedle();
        }
    }

    this.Initialize();
}


FPSMeter.prototype.Initialize = function () {
    this.canvas = document.getElementById("FPSCanvas");
    this.context = this.canvas.getContext("2d");
    this.fpsNeedle = document.getElementById('FPSNeedle');
    this.Draw();
};
