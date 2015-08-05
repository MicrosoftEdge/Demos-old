var features = [["Initial", 0, 0, 1, 1, 0.648, 0, 0.9], ["WelcomeStart", -501, -300, 12.03, 1, 0.681, 0, 0.9], ["WelcomeEnd", 499, -300, 10.25, 1, 0.672, 0, 0.9], ["HTML5Start", 333, -191, 4.9, 1, 0.702, 0, 0.9], ["HTML5End", 333, 67, 3.45, 1, 0.718, 0, 0.9], ["Compat", -433, 237, 6.6, 1, 0.707, 0, 0.9], ["DOMStart", -369, -218, 6.913, 1, 0.661, 0, 0.9], ["DOMEnd", -369, -78, 4, 4.11, 0.711, 0, 0.9], ["Performance", 324, 135, 5.19, 1, 0.684, 0, 0.9], ["FastFluid", -373, 132, 4.1, 1, 0.663, 0, 0.9], ["AdvancedLayoutStart", -29, -235, 5.4, 1, 0.723, 0, 0.9], ["AdvancedLayoutEnd", -29, -104, 4.65, 1, 0.631, 0, 0.9], ["ConnectStart", 220, 305, 24.02, 1, 0.662, 0, 0.9], ["ConnectEnd", 517, 305, 12.21, 1, 0.637, 0, 0.9], ["VisualEffectsStart", 84, 67, 5.22, 1, 0.719, 0, 0.9], ["VisualEffectsEnd", 84, 302, 4.11, 1, 0.718, 0, 0.9], ["TouchFirst", -140, 217, 5.01, 1, 0.633, 0, 0.9], ["Finger", -130, 56, 8.22, 1, 0.681, 0, 0.9], ["JavaScript", -291, -15, 5.18, 1, 0.707, 0, 0.9], ["Cloud", 63, -26, 6.22, 1, 0.681, 0, 0.9], ["Cloud", 63, -26, 0.0014, 1, 0.619, 0, 0.9], ["Cloud", 63, -26, 12, 1, 0.676, 0, 0.9], ["Final", 0, 0, 1, 1, 0.802, 0, 0.9], ["Windows8", -4, -302, 4.8, 1, 0.224, 0, 0.9], ["Face", -459, 28, 6, 1, 0.382, 0, 0.9], ["Final", 0, 0, 0.7, 1, 0.841, 0, 0.9]];
var windowWidth = 0, windowHeight = 0, sourceWidth = 1227, sourceHeight = 842, initialWidth = 260, currentLeft = 0, currentTop = 0, currentWidth = 0, targetLeft = 0, targetTop = 0, targetWidth = 0, targetHeight = 0, index = -1, startTime, endTime, seconds, tenths, targets = features, running = false, browserName = "", browserVersion = "";
var cb = document.getElementById("Chalkboard"), ecb = document.getElementById("EmptyChalkboard"), intro = document.getElementById("Intro"), timer = document.getElementById("Timer"), results = document.getElementById("Results"), audio = document.getElementById("Audio"), rasc = document.getElementById("ReturnAndShareControls");

function Initialize() {
    GetBrowserInformation();
    windowWidth = document.body.offsetWidth;
    windowHeight = document.body.offsetHeight;
    currentWidth = initialWidth;
    currentLeft = (windowWidth - currentWidth - 500) / 2;
    currentTop = (windowHeight / 2) - 100;
    targetLeft = currentLeft;
    targetTop = currentTop;
    targetWidth = currentWidth;
    intro.style.left = (currentLeft + currentWidth) + "px";
    intro.style.top = currentTop + "px";
    intro.style.visibility = "visible";
    cb.style.visibility = "visible";
    Position();
    setTimeout("window.addEventListener('resize', ResizeWindow, false);", 2000);
    window.requestAnimFrame = (function () { return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); }; })();
}

function ResizeWindow() {
    window.location.reload();
}

function RunBenchmark() {
    if (running === false) {
        running = true;
        intro.className += "Hide";
        setTimeout(BeginResizing, 1200);
    }
}

function BeginResizing() {
    intro.style.visibility = "hidden";
    rasc.style.visibility = "hidden";
    startTime = new Date();
    IncrementResizeTarget();
}

function IncrementResizeTarget() {
    if (index < targets.length - 1) {
        index++;
        targetWidth = sourceWidth * targets[index][3];
        targetHeight = sourceHeight * targets[index][3];
        targetLeft = ((windowWidth - targetWidth) / 2) - (targets[index][1] * targets[index][3]);
        targetTop = ((windowHeight - targetHeight) / 2) - (targets[index][2] * targets[index][3]);
        try {audio.volume = targets[index][7]; audio.currentTime = 0; audio.play(); } catch (e) {}
        setTimeout(Move, targets[index][6]);
    }
    else {
        setTimeout(Finished, 1200);
    }
}

function Move() {
    var now = new Date();
    tenths = (now.getTime() - startTime.getTime()) / 1000;
    timer.innerHTML = tenths.toFixed(2) + " Seconds";
    currentLeft = (currentLeft < targetLeft) ? currentLeft + ((targetLeft - currentLeft) * targets[index][5]) : currentLeft - ((currentLeft - targetLeft) * targets[index][5]);
    currentTop = (currentTop < targetTop) ? currentTop + ((targetTop - currentTop) * targets[index][5]) : currentTop - ((currentTop - targetTop) * targets[index][5]);
    currentWidth = (currentWidth < targetWidth) ? currentWidth + ((targetWidth - currentWidth) * targets[index][5]) : currentWidth - ((currentWidth - targetWidth) * targets[index][5]);
    if (Math.abs(currentLeft - targetLeft) < 0.01 && Math.abs(currentTop - targetTop) < 0.01 && Math.abs(currentWidth - targetWidth) < 0.01) { IncrementResizeTarget(); } else { requestAnimFrame(Move); }
    Position();
}

function Position() {
    cb.style.width = currentWidth + "px";
    cb.style.left = currentLeft + "px";
    cb.style.top = currentTop + "px";
}

function Finished() {
    ecb.style.visibility = "visible";
    ecb.style.width = currentWidth + "px";
    ecb.style.left = currentLeft + "px";
    ecb.style.top = currentTop + "px";
    cb.style.opacity = 0;
    rasc.style.visibility = "visible";
    results.style.opacity = 1;
    timer.style.opacity = 0;
    setTimeout(ShowResults, 800);
}

function ShowResults() {
    results.style.visibility = "visible";
    document.getElementById("Title").innerHTML = browserName + " " + browserVersion + " Score";
    document.getElementById("FinalTime").innerHTML = tenths.toFixed(2) + " Seconds";
}

function GetBrowserInformation() {
    var ua = navigator.userAgent.toLowerCase();
    if (document.documentMode) { browserName = "Internet Explorer"; browserVersion = "" + document.documentMode; }
    else if (ua.indexOf('chrome') > -1) { browserName = "Google Chrome"; browserVersion = "" + parseFloat('' + ua.substring(ua.indexOf('chrome') + 7)); }
    else if (ua.indexOf('firefox') > -1) { browserName = "Mozilla Firefox"; browserVersion = "" + parseFloat('' + ua.substring(ua.indexOf('firefox') + 8)); }
    else if (ua.indexOf('minefield') > -1) { browserName = "Mozilla Firefox Minefield"; browserVersion = "" + parseFloat('' + ua.substring(ua.indexOf('minefield') + 10)); }
    else if (ua.indexOf('opera') > -1) { browserName = "Opera"; browserVersion = ""; }
    else if (ua.indexOf('safari') > -1) { browserName = "Apple Safari"; browserVersion = "" + parseFloat('' + ua.substring(ua.indexOf('safari') + 7)); }
}