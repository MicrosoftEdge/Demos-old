var DEBUG = false;
var SINGLE_CYCLE = 16.7;
var INTRODUCTION_DELAY = 400;

var performance, water, frame, fishBowl, logo, fpsMeter, loadingCover;
var drawInterval;

var sceneLeft, sceneTop, sceneWidth, sceneHeight;
var marginTop = 130, marginBottom = 36, marginLeft = 190, marginRight = 100;
var fishBowlWidth = 0, fishBowlHeight = 0;

this.fishOptions = new Array(1, 10, 100, 250, 500, 750, 1000, 1250, 1500, 1750, 2000);


function Initialize() {
    LoadResources();
    CalculateSceneDimensions();

    loadingCover = new LoadingCover();
    performance = new Performance();
    water = new Water();
    frame = new Frame();
    fishBowl = new FishBowl();
    logo = new Logo();
    fpsMeter = new FPSMeter();

    ResizeScene();
    AttachEvents();
    StartDrawing();
}


function FinishLoading() {
    ResizeScene();
    loadingCover.Hide();
    fishBowl.SetFishCount(10);
}


function StartDrawing() {
    performance.BeginTrending();
    DrawScene();
    clearInterval(drawInterval);
    drawInterval = setInterval(DrawScene, SINGLE_CYCLE);
}


function StopDrawing() {
    clearInterval(drawInterval);
}


function StepDrawing() {
    DrawScene();
}


function CalculateSceneDimensions() {
    sceneLeft = 0;
    sceneTop = 0;
    sceneWidth = document.body.offsetWidth;
    sceneHeight = document.body.offsetHeight;
    fishBowlWidth = sceneWidth - marginLeft - marginRight;
    fishBowlHeight = sceneHeight - marginTop - marginBottom;
}


function AttachEvents() {
    window.addEventListener("resize", ResizeScene, false);
    window.addEventListener("keydown", KeyPress, false);
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); }, false);
	document.addEventListener("MSGestureHold", function (e) { e.preventDefault(); }, false);
	window.addEventListener("dragstart", function (e) { e.preventDefault(); }, false); 
	window.addEventListener("selectstart", function (e) { e.preventDefault(); }, false);
}


function ResizeScene() {
    CalculateSceneDimensions();
    loadingCover.Resize();
    loadingCover.Show();
    water.Resize();
    frame.Resize();
    fishBowl.Resize();
    logo.Resize();
    fpsMeter.Resize();
    performance.Resize();
    if (resourceLoadCompleted == true) {
        loadingCover.Hide();
    }
}


function DrawScene() {
    performance.BeginDrawLoop();
    fishBowl.Draw();
    performance.DrawDashboard();
    fpsMeter.Draw();
    performance.FinishDrawLoop();
}


function StartTest() {
    document.getElementById("FishCount").value = "Auto";
}


function ToggleMenu() {
    if (menuVisible == true) {
        menuVisible = false;
		if(window.newHeight) {
			document.getElementById("FishMenu").style.height = window.newHeight;
		} else {
			document.getElementById("FishMenu").style.height = "10px";
		}
        document.getElementById("FishMenu").style.borderWidth = "0px";
        document.getElementById("FishMenu").style.backgroundColor = "White";
    }
    else {
        menuVisible = true;
        document.getElementById("FishMenu").style.height = "auto";
        document.getElementById("FishMenu").style.borderWidth = "1px";
        document.getElementById("FishMenu").style.borderColor = "#9f9f9f";
        document.getElementById("FishMenu").style.borderStyle = "Solid";
        document.getElementById("FishMenu").style.backgroundColor = "#e0e0e0";
    }

}
var menuVisible = false;


function HandleMenuClick(c) {
    fishBowl.SetFishCount(c);
    ToggleMenu();
}
