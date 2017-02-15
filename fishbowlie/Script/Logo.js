function Logo() {

    this.canvas;
    this.context;
    this.displayLogo = true;

    this.logoWidth = 165;
    this.logoHeight = 67;
    this.logoTop = 108;
    this.logoLeft = 48;

    this.Resize = function () {
        if (this.displayLogo === true) {
            this.canvas.style.top = this.logoTop + "px";
            this.canvas.style.left = this.logoLeft + "px";
            this.canvas.setAttribute("width", this.logoWidth);
            this.canvas.setAttribute("height", this.logoHeight);
            this.Draw();
        }
    }

    this.Draw = function () {
        if (this.displayLogo === true) {
            this.context.clearRect(0, 0, this.logoWidth, this.logoHeight);
            this.context.drawImage(imgLogo, 0, 0, this.logoWidth, this.logoHeight);
        }
    }

    this.Show = function () {
        this.displayLogo = true;
        document.getElementById("chkLogo").setAttribute("class", "Control Enabled");
        this.Resize();
    }

    this.Hide = function () {
        this.displayLogo = false;
        document.getElementById("chkLogo").setAttribute("class", "Control Disabled");
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.setAttribute("width", 0);
        this.canvas.setAttribute("height", 0);
    }

    this.ToggleVisibility = function () {
        if (this.displayLogo == true) {
            this.Hide();
        }
        else {
            this.Show();
        }
    }

    this.Initialize();
}


Logo.prototype.Initialize = function () {
    this.canvas = document.getElementById("LogoCanvas");
    this.context = this.canvas.getContext("2d");
    this.Draw();
};
