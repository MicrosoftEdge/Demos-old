SnowPostcard = (function () {

    "use strict";

    // required DOM elements
    var postcardContainer = document.getElementById("postcardContainer");
    var postcard = document.getElementById("postcard");
    var hint = document.getElementById("hint");

    // store canvases and contexts in those
    var csContext;
    var csCanvas;
    var csPathContext;
    var csPathCanvas;
    var snowCanvas;
    var snowContext;

    // we're getting events from parent div, so we need placement information to adjust
    var bounds;
    var fixedImageBottom = 305;
    var fixedImageWidth = 475;
    var fixedImageHeight = 314;
    var fixedImageMarginLeft = 30;

    // track user input
    var pointerDown = false;
    var stroke = [];

    // default greetings image
    var defaultImageLocation = "./Messages/Message2.png";
    // alternative secret image
    var defaultAlternativeImageLocation = "./Messages/alternativeImage.png";

    // external initilization
    function show() {
        createCompositePhoto();
        showHint();
    }

    // show/hide the hint
    function showHint() {
        hint.style.opacity = 1.0;
    }

    function hideHint() {
        hint.style.opacity = 0;
    }

    // request to render single frame on demand
    function requestFrameRender() {
        Animation.getRequestAnimationFrame(renderCompositePhoto);
    }

    // get personalized greeting message
    function getPersonalizedMessage() {
        var imageLocation = defaultImageLocation;
        var separatorIndex = window.location.href.indexOf('?');
        if (separatorIndex > 0) {
            var imageFilename = window.location.href.slice(separatorIndex + 1);
            if (imageFilename.length === 10) {
                imageLocation = "./Messages/" + imageFilename + ".png";
            }
        }
        return imageLocation;
    }

    // render user input and compose layers
    function renderCompositePhoto() {
        var ro = Gfx.getDefaultRenderOptions();
        ro.context = csPathContext;
        Gfx.renderPath(stroke, ro);
        stroke = [];

        // compose layers
        var pipeline = [
        // composing on cleared snow canvas
                    csContext,
        // snow on a postcard
                    snowCanvas,
        // cleared snow path
                    csPathCanvas];
        // "subtract" cleared snow path
        var composeOptions = ["", "", "destination-out"];
        Gfx.composeLayers(pipeline, composeOptions);
    }

    function createPhotoImage(imageSrc) {
        var image = document.createElement("img");
        image.id = "personalizedGreeting";
        image.onload = function () {
            postcard.appendChild(image);
        }
        image.src = getPersonalizedMessage();
    }

    function createCanvas() {
        var canvas = document.createElement("canvas");
        canvas.width = postcard.clientWidth;
        canvas.height = postcard.clientHeight;
        return canvas;
    }

    function createSnowImage() {
        snowCanvas = createCanvas();
        snowCanvas.id = "snowCanvas"
        snowContext = snowCanvas.getContext("2d");
        snowContext.fillStyle = "rgba(255, 255, 255, 1.0)";
        snowContext.fillRect(
            0,
            0,
            snowCanvas.width,
            snowCanvas.height);
    }

    function createClearedSnow() {
        // cleared snow path
        csPathCanvas = createCanvas();
        csPathContext = csPathCanvas.getContext("2d");
        // cleared snow (compose result - in DOM and visible)
        csCanvas = createCanvas();
        csCanvas.className = "clearedSnowCanvas";
        postcard.appendChild(csCanvas);
        csContext = csCanvas.getContext("2d");
    }

    // correct by bounding rectangle
    function calcOffset(evt) {
        return {
            x: evt.clientX - bounds.left,
            y: evt.clientY - bounds.top
        }
    }

    // mouse and touch (IE) handlers
    function pointerDownHandler(evt) {
        hideHint();
        Touch.preventEvents(evt);
        pointerDown = true;
        stroke.push(calcOffset(evt));
        requestFrameRender();
    }

    function pointerMoveHandler(evt) {
        Touch.preventEvents(evt);
        if (evt.buttons > 0) { pointerDown = true; }
        if (pointerDown) {
            stroke.push(calcOffset(evt));
            requestFrameRender();
        }
    }

    function pointerUpHandler(evt) {
        Touch.preventEvents(evt);
        pointerDown = false;
        stroke = [];
    }

    function createCompositePhoto() {
        // if we're repopulating the photo - flush childNodes
        if (postcard.childNodes.length > 1) {
            postcard.innerHTML = ""
        };

        // snow image
        createSnowImage();
        // canvas to hold cleared path + visible top-level canvas with "cleared snow"
        createClearedSnow();
        // personalized greeting
        createPhotoImage();

        // initial render request to show the composite image with all layers in place
        renderCompositePhoto();

        // touch events (IE) if supported
        if (window.navigator.msPointerEnabled) {
            postcardContainer.addEventListener("MSPointerDown", pointerDownHandler);
            postcardContainer.addEventListener("MSPointerUp", pointerUpHandler);
            postcardContainer.addEventListener("MSPointerCancel", pointerUpHandler);
            postcardContainer.addEventListener("MSPointerMove", pointerMoveHandler);
        } else {
            postcardContainer.addEventListener("mousedown", pointerDownHandler);
            postcardContainer.addEventListener("mouseup", pointerUpHandler);
            postcardContainer.addEventListener("mouseleave", pointerUpHandler);
            postcardContainer.addEventListener("mousemove", pointerMoveHandler);
        }
    }

    // place snowmark from snowflake that hit the postcard
    function addSnowmark(x, y, image) {
        // the snowflake will be scaled from min to max to add variety
        var minScale = 0.5;
        var maxScale = 2;
        var scale = Math.random() * (maxScale - minScale) + minScale;
        var w = image.width;
        var h = image.height;

        var minOpacity = 0.3;
        var maxOpacity = 0.9;
        csPathContext.globalAlpha = Math.random() * (maxOpacity - minOpacity) + minOpacity;
        csPathContext.globalCompositeOperation = "destination-out";
        csPathContext.drawImage(
        // image
            image,
        // source x
            0,
        // source y
            0,
        // source width
            w,
        // source height
            h,
        // target x
            x - w / 2,
        // target y
            y - h / 2,
        // target width
            w * scale,
        // target height
            h * scale);
        // request to update that out of normal rendering loop
        requestFrameRender();
    }

    // update postcard bounds to handle events
    function updateBounds() {
        bounds = {
            width: fixedImageWidth,
            height: fixedImageHeight,
            left: (window.innerWidth - fixedImageWidth + fixedImageMarginLeft) / 2,
            right: (window.innerWidth + fixedImageWidth + fixedImageMarginLeft) / 2,
            top: window.innerHeight - (fixedImageHeight + fixedImageBottom),
            bottom: window.innerHeight - fixedImageBottom
        }

        return bounds;
    }

    return {
        "show": show,
        "addSnowmark": addSnowmark,
        "updateBounds": updateBounds,
        "defaultImage": defaultImageLocation,
        "altImage": defaultAlternativeImageLocation
    };
})();
