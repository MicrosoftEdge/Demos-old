var SINGLE_CYCLE = 16.7;

var debug = false, started = false;
var sceneLeft, sceneTop, sceneWidth, sceneHeight;
var drawInterval, characters, snowstorm, imgSnowflake;

function Initialize() {
    GetBrowserInformation();
    RegisterEventHandlers();
    CalculateSceneDimensions();
    snowstorm = new Snowstorm();
    characters = new Characters();
    imgSnowflake = new Image();
    imgSnowflake.src = "Images/Snowflakes.png";
    ResizeScene();
}

document.addEventListener("DOMContentLoaded", Initialize, false);

function RegisterEventHandlers() {
    window.addEventListener("resize", ResizeScene, false);
    document.getElementById("StartButton").addEventListener("click", StartPenguinMark, false);
    document.getElementById("ResetButton").addEventListener("click", ResetDemo, false);
    document.getElementById("ToggleAudioButton").addEventListener("click", ToggleAudio, false);
}

function CalculateSceneDimensions() {
    sceneLeft = 0;
    sceneTop = 0;
    sceneWidth = document.getElementById("Scene").offsetWidth;
    sceneHeight = document.getElementById("Scene").offsetHeight;
}

function ToggleAudio() {

    var audioEntryElement = document.getElementById("AudioEntryElement");
    var audioTrackElement = document.getElementById("AudioTrackElement");
    var muteAudioButton = document.getElementById("ToggleAudioButton");

    if (audioEntryElement.volume === 0) {
        audioEntryElement.volume = 1;
        audioTrackElement.volume = 1;
        muteAudioButton.innerHTML = "Mute audio";
    } else {
        audioEntryElement.volume = 0;
        audioTrackElement.volume = 0;
        muteAudioButton.innerHTML = "Unmute audio";
    }

}

function ResizeScene() {
    CalculateSceneDimensions();
    characters.Resize();
    snowstorm.Resize();
}

function StartPenguinMark() {
    if (started == false) {
        started = true;
        document.getElementById("WelcomeScreen").style.display = "none";
        document.getElementById("AudioEntryElement").pause();
        document.getElementById("ToggleAudioButton").style.display = "none";
        document.getElementById("AudioTrackElement").play();
        characters.Start();
        snowstorm.Start();
    }
}

function ShowResults() {
    document.getElementById("WelcomeScreen").style.visibility = "hidden";
    document.getElementById("ResultsTree").src = "Images/" + browserPenguin;
    document.getElementById("ResultsLabel").innerHTML = "PenguinMark Score";
    document.getElementById("ResultsBrowser").innerHTML = "Using " + browserName + " " + browserVersion;
    document.getElementById("ResultsScreen").style.visibility = "visible";
    document.getElementById("ResultsScreen").style.opacity = 1;
    document.getElementById("ResultsHeading").innerHTML = snowstorm.currentScore;
}

function ResetDemo() {
    window.location.reload();
}