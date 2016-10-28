var modeApple = false, modeDean = false, modeOops = false, modePrivacy = false, modeCambridge;

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

        case 13: // RETURN: Start Benchmark
            StartPenguinMark();
            break;

        case 64: // B: Begin / Start Benchmark
            StartPenguinMark();
            break;

        case 65: // A: Apple Mode
            if (modeApple) {
                document.getElementById("PenguinSafari").style.backgroundImage = "url(Images/SafariPenguin.png)";
            }
            else {
                document.getElementById("PenguinSafari").style.backgroundImage = "url(Images/SafariPenguinIPad.png)";
            }
            modeApple = (modeApple) ? false : true;
            break;

        case 67: // C: Cambridge Mode
            if (modeCambridge) {
                document.getElementById("PenguinIE").style.backgroundImage = "url(Images/IEPenguin.png)";
            }
            else {
                document.getElementById("PenguinIE").style.backgroundImage = "url(Images/IEPenguinHarvard.png)";
            }
            modeCambridge = (modeCambridge) ? false : true;
            break;

        case 68: // D: Dean Mode
            if (modeDean) {
                document.getElementById("PenguinIE").style.backgroundImage = "url(Images/IEPenguin.png)";
            }
            else {
                document.getElementById("PenguinIE").style.backgroundImage = "url(Images/IEPenguinDean.png)";
            }
            modeDean = (modeDean) ? false : true;
            break;

        case 72: // H: Hide Characters
            characters.HideAllCharacters();
            break;

        case 77: // M: Mute Mode
            document.getElementById("AudioEntryElement").pause();
            document.getElementById("AudioTrackElement").pause();
            break;

        case 79: // O: Oops Mode
            if (modeOops) {
                document.getElementById("PenguinChrome").style.backgroundImage = "url(Images/ChromePenguin.png)";
            }
            else {
                document.getElementById("PenguinChrome").style.backgroundImage = "url(Images/ChromePenguinDiaper.png)";
            }
            modeOops = (modeOops) ? false : true;
            break;

        case 80: // P: Privacy Mode
            if (modePrivacy) {
                document.getElementById("PenguinChrome").style.backgroundImage = "url(Images/ChromePenguin.png)";
            }
            else {
                document.getElementById("PenguinChrome").style.backgroundImage = "url(Images/ChromePenguinMagazine.png)";
            }
            modePrivacy = (modePrivacy) ? false : true;
            break;

        case 82: // R: Reset Demo
            ResetDemo();
            break;

        case 83: // S: Show Characters
            characters.ShowAllCharacters();
            break;

        case 84: // T: Toggle Borders
            characters.ToggleBorders();
            break;

    }

    //alert("Key:" + key);
}
