function Frame() {

    this.canvas;
    this.context;
    this.buffer = 2;
    this.displayFrame = true;

    this.Initialize();

    this.Resize = function () {
        if (this.displayFrame === true) {
            this.canvas.style.top = "0px";
            this.canvas.style.left = "0px";
            this.canvas.setAttribute("width", sceneWidth);
            this.canvas.setAttribute("height", sceneHeight);
            this.Draw();
        }
    }

    this.Draw = function () {
        if (this.displayFrame === true) {
            this.context.fillStyle = "rgb(255,255,255)";
            this.context.clearRect(0, 0, sceneWidth, sceneHeight);
            this.context.fillRect(0, 0, sceneWidth, marginTop + this.buffer);
            this.context.fillRect(0, 0, marginLeft + this.buffer, sceneHeight);
            this.context.fillRect(0, sceneHeight - marginBottom - this.buffer, sceneWidth, marginBottom + this.buffer);
            this.context.fillRect(sceneWidth - marginRight - this.buffer, 0, marginRight + this.buffer, sceneHeight);
        }
    }

    this.Show = function () {
        document.getElementById("chkFrame").setAttribute("class", "Control Enabled");
        this.displayFrame = true;
        this.Resize();
    }

    this.Hide = function () {
        document.getElementById("chkFrame").setAttribute("class", "Control Disabled");
        this.displayFrame = false;
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.canvas.setAttribute("width", 0);
        this.canvas.setAttribute("height", 0);
    }

    this.ToggleVisibility = function () {
        if (this.displayFrame === true) {
            this.Hide();
        }
        else {
            this.Show();
        }
    }

}


Frame.prototype.Initialize = function () {
    this.canvas = document.getElementById("FrameCanvas");
    this.context = this.canvas.getContext("2d");
};
