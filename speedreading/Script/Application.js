
/* -------------------------------------------------------- Speed Reading Application --- */

var COUNT_HORIZONTAL_TILES = 16;
var COUNT_VERTICAL_TILES = 6;
var SINGLE_CYCLE = 16.7;
var NUMBER_CHARACTERS = 78;
var ANIMATION_SPEED = 3;

var surface, surfaceWidth, surfaceHeight, surfaceCanvas, surfaceContext;
var drawInterval;
var composite;
var repeatSound = false;
var billboard;
var perf;
var debug = false;

var startButtonVisible = false;
var startButtonHideCalled = false;
var startButtonHover = false;

var tryAgainButtonVisible = false;
var tryAgainButtonHover = false;

var redrawSurface = false;
var incrementRedraws = true;



function Initialize() {

    surfaceCanvas = document.getElementById('surfaceCanvas');
    if (surfaceCanvas.getContext) {
        surfaceContext = surfaceCanvas.getContext('2d');
        surface = surfaceContext;
    }

    surfaceWidth = surfaceCanvas.offsetWidth;
    surfaceHeight = surfaceCanvas.offsetHeight;
    surfaceCanvas.setAttribute("width", surfaceWidth);
    surfaceCanvas.setAttribute("height", surfaceHeight);

    RegisterEventHandlers();
    LoadResources();

    perf = new Performance();
    perf.Initialize();

    billboard = new Billboard();
    billboard.Initialize();

    drawInterval = setInterval(DrawLoop, SINGLE_CYCLE);
}



/* ---------------------------------------------------------------------- DrawSurface --- */

function DrawLoop() {

    if (redrawSurface == true) {

        if (incrementRedraws == true) {
            perf.BeginDrawLoop();
        }

        surface.fillStyle = '#01294d';
        surface.fillRect(0, 0, surfaceWidth, surfaceHeight);
        surface.drawImage(imgBackground, 0, 0, surfaceWidth, 800);
        billboard.Draw();

        if (startButtonVisible == true && startButtonHideCalled == false) {
            if (startButtonHover == true) {
                surface.drawImage(imgStartButtonHover, billboard.startButtonLeft, billboard.startButtonTop, billboard.startButtonWidth, billboard.startButtonHeight);
            }
            else {
                surface.drawImage(imgStartButton, billboard.startButtonLeft, billboard.startButtonTop, billboard.startButtonWidth, billboard.startButtonHeight);
            }
        }

        if (tryAgainButtonVisible == true) {
            if (tryAgainButtonHover == true) {
                surface.drawImage(imgTryAgainButtonHover, billboard.startButtonLeft, billboard.startButtonTop, billboard.startButtonWidth, billboard.startButtonHeight);
            }
            else {
                surface.drawImage(imgTryAgainButton, billboard.startButtonLeft, billboard.startButtonTop, billboard.startButtonWidth, billboard.startButtonHeight);
            }
        }

        if (incrementRedraws == true) {
            perf.FinishDrawLoop();
        }
        perf.Draw();
    }
}

function DrawSurface() {
    if (redrawSurface == false) {
        redrawSurface = true;
        DrawLoop();
        redrawSurface = false;
    }
}

function StartDrawing() {
    redrawSurface = true;
    incrementRedraws = true;
}

function StopDrawing() {
    redrawSurface = false;
    incrementRedraws = false;
}

function StopEverything() {
    StopDrawing();
    HideStartButton();
    HideTryAgainButton();
}



/* --------------------------------------------------------------- Welcome Sequence --- */

var composite;

function DisplayInitialBlankBillboard() {
    DrawSurface();
    DrawSurface();
    billboard.ApplyBillboardSequence(new BillboardSequence(billboard.messages.BlankMessage(), true, true, true, true, true, true, false, 0, 'billboard.patterns.StartAtSameTime()', 'setTimeout(DisplayQuestionSpeedReading, 600)', 0));
    DrawSurface();
}

function DisplayQuestionSpeedReading() {
    perf.StartWarmupSequence();
    billboard.ApplyBillboardSequence(new BillboardSequence(billboard.messages.SpeedReadingQuestion(), true, true, true, true, true, false, 0, false, 'billboard.patterns.Random(20)', 'setTimeout(DisplayQuestionSpeedReading_Completed, 0)', 0));
}

function DisplayQuestionSpeedReading_Completed() {
    perf.StopWarmupSequence();
    setTimeout(DisplayStartButton, 600)
}



/* -------------------------------------------------------------------- Start Button --- */

function DisplayStartButton() {
    startButtonVisible = true;
    HandleMouseOver();
    DrawSurface();
}

function HideStartButton() {
    startButtonVisible = false;
    startButtonHideCalled = true;
    document.body.style.cursor = "default";
}

function StartButtonClicked() {
    HideStartButton();
    DrawSurface();
    setTimeout(StartTest, 800);
}



/* --------------------------------------------------------------- Try Again Button --- */

function DisplayTryAgainButton() {
    tryAgainButtonVisible = true;
    HandleMouseOver();
    DrawSurface();
}

function HideTryAgainButton() {
    tryAgainButtonVisible = false;
    DrawSurface();
    document.body.style.cursor = "default";
}

function TryAgainButtonClicked() {
    window.location.reload();
}



/* -------------------------------------------------- Display Next Feature Iterators --- */

var featureList, currentFeature = 0, totalCallbackDuration = 0;

function DisplayNextFeature() {
    billboard.ApplyBillboardSequence(featureList[currentFeature]);
}

function DisplayNextFeature_Callback() {
    setTimeout(DisplayNextFeature, featureList[currentFeature].callbackDuration);
    totalCallbackDuration += featureList[currentFeature].callbackDuration;
    currentFeature++;
}



/* ----------------------------------------------------------------------- Test --- */

function StartTest() {

    currentFeature = 0;
    totalCallbackDuration = 0;

    featureList = new Array();

    perf.StartTest();

    //featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, true, true, true, true, 0, true, 'billboard.patterns.TopToBottomCascade(3)', 'DisplayNextFeature_Callback()', 800));

    featureList.push(new BillboardSequence(billboard.messages.Ready(), true, true, true, true, true, true, 0, true, 'billboard.patterns.StartAtSameTime()', 'DisplayNextFeature_Callback()', 800));
    featureList.push(new BillboardSequence(billboard.messages.Set(), true, true, true, true, true, true, 0, true, 'billboard.patterns.StartAtSameTime()', 'DisplayNextFeature_Callback()', 800));
    featureList.push(new BillboardSequence(billboard.messages.Go(), true, true, true, true, true, true, 0, true, 'billboard.patterns.StartAtSameTime()', 'DisplayNextFeature_Callback()', 800));

    featureList.push(new BillboardSequence(billboard.messages.Overview01(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.FirstToLastCascade(15)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview02(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.FirstToLastCascade(15)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview03(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.FirstToLastCascade(15)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview04(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.BottomToTopCascade()', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview05(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.RightToLeftCascade()', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview06(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.Random(3)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview07(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.TopToBottomCascade(3)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.Overview08(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.LeftToRightCascade()', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.GPUPowered(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.RightToLeftCascade()', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.CSS3Support(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.BottomToTopCascade()', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.DOMSupport1(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.Random(2)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.DOMSupport2(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.TopToBottomCascade(3)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.JavaScript(), true, true, true, true, true, true, 0, true, 'billboard.patterns.Random(1)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, false, true, true, false, 0, true, 'billboard.patterns.RightToLeftCascade()', 'TestComplete_Callback()', 0));


    DisplayNextFeature();
}

function TestComplete_Callback() {
    perf.StopTest();
    var message = "                 Browser Score                   " + Math.floor(((perf.testDuration - totalCallbackDuration) / 1000)) + " Seconds";
    billboard.ApplyBillboardSequence(new BillboardSequence(message, true, true, true, true, true, true, 0, true, 'billboard.patterns.StartAtSameTime()', 'setTimeout(DisplayTryAgainButton, 800)', 0));
}




/* ------------------------------------------------------------------------- Billboard Features --- */

function DisplayBillboardFeatures() {

    currentFeature = 0;
    featureList = new Array();

    featureList.push(new BillboardSequence(billboard.messages.BlankMessage(), false, true, true, true, true, true, 0, true, 'billboard.patterns.TopToBottomCascade(3)', 'DisplayNextFeature_Callback()', 100));
    featureList.push(new BillboardSequence(billboard.messages.BillboardUppercase(), false, true, true, true, true, true, 0, true, 'billboard.patterns.Random(20)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BillboardLowercase(), false, true, true, true, true, true, 0, true, 'billboard.patterns.Random(20)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BillboardNumbers(), false, true, true, true, true, true, 0, true, 'billboard.patterns.Random(20)', 'DisplayNextFeature_Callback()', 0));
    featureList.push(new BillboardSequence(billboard.messages.BillboardSymbols(), false, true, true, true, true, true, 0, true, 'billboard.patterns.Random(20)', 'DisplayNextFeature_Callback()', 0));



    DisplayNextFeature();

}

