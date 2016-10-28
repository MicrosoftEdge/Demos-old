function Water() {

    this.waterAudio;
    this.waterVideo;
    this.playAudio = true;
    this.playVideo = true;

    this.Initialize = function () {
        this.waterAudio = document.getElementById("WaterAudio");
        this.waterVideo = document.getElementById("WaterVideo");
    }
    this.Initialize();

    this.Resize = function () {

        if (this.playVideo === true) {

            if ((sceneWidth / 16) > (sceneHeight / 9)) {
                this.waterVideo.style.left = "0px";
                this.waterVideo.style.width = sceneWidth + "px";
                this.waterVideo.style.top = (-((sceneWidth / 16 * 9) - sceneHeight) / 2) + "px";
                this.waterVideo.style.height = (sceneWidth / 16 * 9) + "px";
            }
            else {
                this.waterVideo.style.left = (-((sceneHeight / 9 * 16) - sceneWidth) / 2) + "px";
                this.waterVideo.style.width = (sceneHeight / 9 * 16) + "px";
                this.waterVideo.style.top = "0px";
                this.waterVideo.style.height = sceneHeight + "px";
            }
        }
    }

    this.PlayVideo = function () {
        document.getElementById("chkWater").setAttribute("class", "Control Enabled");
        this.playVideo = true;
        this.waterVideo.play();
        this.Resize();
    }

    this.PauseVideo = function () {
        document.getElementById("chkWater").setAttribute("class", "Control Disabled");
        this.playVideo = false;
        this.waterVideo.pause();
        this.waterVideo.style.left = "0px";
        this.waterVideo.style.width = "0px";
        this.waterVideo.style.top = "0px";
        this.waterVideo.style.height = "0px";
    }

    this.ToggleVisibility = function () {
        if (this.playVideo === true) {
            this.PauseVideo();
        }
        else {
            this.PlayVideo();
        }
    }

    this.PlayAudio = function () {
        document.getElementById("chkAudio").setAttribute("class", "Control Enabled");
        this.playAudio = true;
        this.waterAudio.play();
    }

    this.PauseAudio = function () {
        document.getElementById("chkAudio").setAttribute("class", "Control Disabled");
        this.playAudio = false;
        this.waterAudio.pause();
    }

    this.ToggleAudio = function () {
        if (this.playAudio === true) {
            this.PauseAudio();
        }
        else {
            this.PlayAudio();
        }
    }
}
