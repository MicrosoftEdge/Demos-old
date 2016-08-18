// This file manages the demo settings including play, pause, and reset.

var fishSwimming = true;

function ToggleFishSwimming() {
    if (fishSwimming === true) {
        fishSwimming = false;
        document.getElementById("Fish").className = "FishSwimming Paused";
        document.getElementById("ButtonToggleSwimming").style.backgroundImage = "url('Images/ButtonPlay.png')";
    }
    else {
        fishSwimming = true;
        document.getElementById("Fish").className = "FishSwimming";
        document.getElementById("ButtonToggleSwimming").style.backgroundImage = "url('Images/ButtonPause.png')";
    }
}

function ResetDemo() {
    window.location.reload();
}

window.addEventListener("keydown", OnKeyDown, false);

function OnKeyDown(e) {

    if (e.keyCode) {
        key = e.keyCode;
    } else if (document.all) {
        key = event.keyCode;
    } else {
        key = ev.charCode;
    }

    switch (key) {
        case 80: // P: Pause Animation
            ToggleFishSwimming();
            break;
        case 82: // R: Reset
            ResetDemo();
            break;
    }

    //alert("Key:" + key);
}