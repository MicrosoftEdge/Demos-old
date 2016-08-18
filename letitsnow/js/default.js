// Initialization and events code for the app
(function () {
    "use strict";

    // secret logic vars
    var defaultMusicTrack = "./res/LetItSnowShort.mp3";
    var alternativeMusicTrack = "./res/LetItSnowRap.mp3";
    var defaultSnowmanImage = "./res/Alpha2.png";
    var alternativeSnowmanImage = "./res/AlphaRapper.png";
    var alternativeIsPlaying = false;
    var musicIsPlaying = true;
    var togglePlaybackCode = 112;
    var secretCode = 114;
    var previousImage;

    // preparing the elements we'll need further
    var snowflakesCanvas = document.getElementById("snowflakesCanvas");
    var snowflakesContext = document.getElementById("snowflakesCanvas").getContext("2d");
    var backgroundGradientCanvas = document.getElementById("backgroundGradient");
    var backgroundGradientContext = backgroundGradientCanvas.getContext("2d");
    var siSnowflakesCount = document.getElementById("siSnowflakesCount");
    var postcard = document.getElementById("postcard");
    var music = document.getElementById("music");
    var snowman = document.getElementById("snowman");

    function resizeCanvasElements() {
        // update internal contraints for the postcard and snowflakes container
        SnowPostcard.updateBounds();
        Snowflakes.updateBounds();
        // resize falling snowflakes canvas to fit the screen
        snowflakesCanvas.width = window.innerWidth;
        snowflakesCanvas.height = window.innerHeight;
        // resize and zoom-in background gradient
        backgroundGradientCanvas.width = window.innerWidth + 400;
        backgroundGradientCanvas.height = window.innerHeight + 400;
    }

    document.addEventListener("keypress", function (evt) {
        // do a secret move
        if (evt.keyCode === secretCode) {
            alternativeIsPlaying = !alternativeIsPlaying;
            var personalizedGreeting = document.getElementById("personalizedGreeting");
            if (alternativeIsPlaying) {
                music.src = alternativeMusicTrack;
                snowman.src = alternativeSnowmanImage;
                previousImage = personalizedGreeting.src;
                personalizedGreeting.src = SnowPostcard.altImage;
            } else {
                music.src = defaultMusicTrack;
                snowman.src = defaultSnowmanImage;
                personalizedGreeting.src = previousImage;
            }
        }
        if (evt.keyCode === togglePlaybackCode) {
            musicIsPlaying = !musicIsPlaying;
            var toggleFunction = (musicIsPlaying) ? music.play() : music.pause();
            if (toggleFunction) { toggleFunction(); }
        }
    });

    document.addEventListener("DOMContentLoaded", function () {

        // initialiaze the snow covered postcard
        SnowPostcard.show();

        // snowflakes selection control initialization
        var snowflakesCountSelect = document.getElementById("siSnowflakes");
        snowflakesCountSelect.addEventListener("change", function (evt) {
            var value = evt.target.options[evt.target.selectedIndex].value;
            if (value) {
                Snowflakes.dynamicSnowflakesCount = (value === "auto");
                if (!Snowflakes.dynamicSnowflakesCount) {
                    Snowflakes.generate(parseInt(value));
                    siSnowflakesCount.textContent = "";
                }
            }
        }, true);

        // post initial system information
        SystemInformation.post(SystemInformation.getInformation());

        //// if the snowflake count = auto - add/remove based on current fps
        //SystemInformation.setOnFpsReport(function (fps) {
        //    if (Snowflakes.dynamicSnowflakesCount) {
        //        if (fps < 55) Snowflakes.remove();
        //        else if (fps >= 59) Snowflakes.add();
        //    }
        //});

        // genarate snowflakes
        Snowflakes.generate(250);

        // properly resize the canvases
        resizeCanvasElements();

        // initialize out animation functions and start animation:
        // falling snowflakes
        Animation.addFrameRenderer(Snowflakes.render, snowflakesContext);
        // background gradient
        Animation.addFrameRenderer(Gradient.render, backgroundGradientContext);
        // start the animation
        Animation.start();

    });

    window.addEventListener("resize", function () {
        // post updated screen size
        SystemInformation.post({ width: window.innerWidth, height: window.innerHeight });
        // properly resize the canvases
        resizeCanvasElements();
    });

})();