

/* ------------------------------------------------------------------ Event Handlers --- */


function RegisterEventHandlers() {
    window.addEventListener("resize", ResizeWindow, false);
    window.addEventListener("mousemove", OnMouseMove, false);
    window.addEventListener("mousedown", OnMouseDown, false);
    window.addEventListener("keydown", OnKeyDown, false);
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); }, false);
    if (window.navigator.msPointerEnabled) {
        document.addEventListener("MSGestureHold", function (e) { e.preventDefault(); }, false);
        window.addEventListener("dragstart", function (e) { e.preventDefault(); }, false);
        window.addEventListener("selectstart", function (e) { e.preventDefault(); }, false);
    }
}



function ResizeWindow() {

    surfaceWidth = surfaceCanvas.offsetWidth;
    surfaceHeight = surfaceCanvas.offsetHeight;
    surfaceCanvas.setAttribute("width", surfaceWidth);
    surfaceCanvas.setAttribute("height", surfaceHeight);
    billboard.SetTileSizes(billboard.Tiles);
    DrawSurface();
}



function OnMouseMove(e) {
    if (typeof e == 'undefined')
        e = window.event;

    mouseX = e.clientX;
    mouseY = e.clientY;

    HandleMouseOver();
}
var mouseX, mouseY;



function HandleMouseOver() {

    if (startButtonVisible == true) {
        if (mouseX > billboard.startButtonLeft && mouseX < (billboard.startButtonLeft + billboard.startButtonWidth) && mouseY > billboard.startButtonTop && mouseY < (billboard.startButtonTop + billboard.startButtonHeight)) {
            document.body.style.cursor = "pointer";
            startButtonHover = true;
            DrawSurface();
        }
        else {
            document.body.style.cursor = "default";
            startButtonHover = false;
            DrawSurface();
        }
    }

    if (tryAgainButtonVisible == true) {
        if (mouseX > billboard.startButtonLeft && mouseX < (billboard.startButtonLeft + billboard.startButtonWidth) && mouseY > billboard.startButtonTop && mouseY < (billboard.startButtonTop + billboard.startButtonHeight)) {
            document.body.style.cursor = "pointer";
            tryAgainButtonHover = true;
            DrawSurface();
        }
        else {
            document.body.style.cursor = "default";
            tryAgainButtonHover = false;
            DrawSurface();
        }
    }

    return false;

}



function OnMouseDown(e) {

    if (startButtonVisible == true) {
        if (mouseX > billboard.startButtonLeft && mouseX < (billboard.startButtonLeft + billboard.startButtonWidth) && mouseY > billboard.startButtonTop && mouseY < (billboard.startButtonTop + billboard.startButtonHeight)) {
            StartButtonClicked();
        }
    }

    if (tryAgainButtonVisible == true) {
        if (mouseX > billboard.startButtonLeft && mouseX < (billboard.startButtonLeft + billboard.startButtonWidth) && mouseY > billboard.startButtonTop && mouseY < (billboard.startButtonTop + billboard.startButtonHeight)) {
            TryAgainButtonClicked();
        }
    }

}



function OnKeyDown(e) {

    var key;

    // Get key code
    if (e.keyCode) {
        key = e.keyCode;
    } else if (document.all) {
        key = event.keyCode;
    } else {
        key = ev.charCode;
    }

    // Handle key
    switch (key) {
        case 82: // R
            window.location.reload();
            break;
        case 68: // D
            debug = (debug == false) ? true : false;
            DrawSurface();
            break;
        case 13: // Enter
            if (startButtonVisible == true) {
                StartButtonClicked();
            }
            else if (tryAgainButtonVisible == true) {
                TryAgainButtonClicked();
            }
            break;
        case 72: // H
            StopEverything();
            composite = true;
            billboard.ApplyBillboardSequence(new BillboardSequence(billboard.messages.HelloSanFrancisco(), true, true, true, true, true, true, 0, true, 'billboard.patterns.StartAtSameTime()', '', 0));
            break;
        case 87: // W
            StopEverything();
            composite = true;
            billboard.ApplyBillboardSequence(new BillboardSequence(billboard.messages.Welcome(), true, true, true, true, true, true, 0, true, 'billboard.patterns.StartAtSameTime()', '', 0));
            break;
        case 66: // B
            StopEverything();
            composite = true;
            DisplayBillboardFeatures();
            break;

    }

    //alert("Key:" + key);
}