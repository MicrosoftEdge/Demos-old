function LoadingCover() {

    var canvas;
    var context;
    var loadingInterval;
    var loadingOpacity = 1;

    this.Resize = function () {
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.setAttribute("width", sceneWidth);
        canvas.setAttribute("height", sceneHeight);
        Draw();
    }

    this.Show = function () {
        clearInterval(loadingInterval);
        loadingOpacity = 1;
        canvas.style.opacity = 1;
        canvas.style.visibility = "visible";
    }

    this.Hide = function () {
        loadingInterval = setInterval(FadeAway, SINGLE_CYCLE);
    }

    var Draw = function () {
        context.fillStyle = "#FFFFFF";
        context.clearRect(0, 0, sceneWidth, sceneHeight);
        context.fillRect(0, 0, sceneWidth, sceneHeight);
        context.font = "18pt Verdana";
        context.fillStyle = "#dfdfdf";
        context.textAlign = "center";
        context.fillText("Initializing FishBowl...", sceneWidth * 0.5, sceneHeight * 0.4);
        document.body.style.opacity = 1;
    }

    var FadeAway = function () {
        if (loadingOpacity < 0.1) {
            clearInterval(loadingInterval);
            canvas.style.visibility = "hidden";
        }
        else {
            loadingOpacity -= ((1 - loadingOpacity) * 0.03) + 0.005;
            canvas.style.opacity = loadingOpacity;
        }
    }

    canvas = document.getElementById("LoadingCanvas");
    context = canvas.getContext("2d");
    this.Resize();
}
