Snowflakes = (function () {

    "use strict";

    // snowflakes objects collection
    var snowflakes = [];
    var snowflakesDefaultCount = 1000;
    // if true - we'll guess the best number of snowflakes for the system
    var dynamicSnowflakesCount = false;
    // we increment snowflakes with this rate
    var snowflakeCountIncrement = 0.1;
    // we can remove aggressively (to quicker free system resources), basically we remove at snowflakeCountIncrement*snowflakeRemoveFactor rate
    var snowflakeRemoveFactor = 2;
    // snowflakes sprites
    var snowflakeSpritesLocation = "./res/Snowflakes.png";
    var snowflakeSprites = [];
    var spritesCount = 5;
    var spriteWidth = 20;
    var spriteHeight = 20;

    // canvas bounds used for snowflake animation
    var bounds = { width: window.innerWidth, height: window.innerHeight };
    // postcard bounds to perform landing
    var landingBounds;
    // postcard landing probability
    var landingProbability = 0.5;

    // particle movement parameters:
    // we'll advance each particle vertically at least by this amount (think gravity and resistance)
    var minVerticalVelocity = 1;
    // we'll advance each particle vertically at most by this amount (think gravity and resistance)
    var maxVerticalVelocity = 4;
    // we'll shift each particle horizontally at least by this amound (think wind and resistance)
    var minHorizontalVelocity = -1;
    // we'll shift each particle horizontally at least by this amound (think wind and resistance)
    var maxHorizontalVelocity = 3;
    // each particle sprite will be scaled down maxScale / this (this < maxScale) at max
    var minScale = 0.2;
    // each particle sprite will be scaled down this / minScale (this > minScale) at max
    var maxScale = 1.25;
    // each particle also "bobs" on horizontal axis (think volumetric resistance) by this amount at least
    var minHorizontalDelta = 2;
    // each particle also "bobs" on horizontal axis (think volumetric resistance) by this amount at most
    var maxHorizontalDelta = 3;
    // each particle is at least this opaque
    var minOpacity = 0.2;
    // each particle is at least this opaque
    var maxOpacity = 0.9;
    // change opacity by at max 1/maxOpacityIncrement
    var maxOpacityIncrement = 50;

    // dynamic speed:
    // do speed correction every speedCorrectionFrames frames
    var speedCorrectionFrames = 60;
    var currentSpeedCorrectionFrame = 0;
    // start without any speed correction
    var speedFactor = 1;
    // fall down to this value at most
    var minSpeedFactor = 0.1;
    // get fast at this value at most
    var maxSpeedFactor = 1.5;
    // don't set value immidietly change gradually by this amount
    var speedFactorDelta = 0.05;

    // snow heap
    var snowHeap = document.getElementById("snowHeap");
    var heapSizeIncrement = 0.00006;
    var minHeapSize = 0.10;
    var maxHeapSize = 0.15;
    var heapSize = minHeapSize;

    // create number of snowflakes adding if required (or regenerate from scratch)
    function generate(number, add) {
        // initialize sprite
        var image = new Image();
        image.onload = function () {
            for (var ii = 0; ii < spritesCount; ii++) {
                var sprite = document.createElement("canvas");
                sprite.width = spriteWidth;
                sprite.height = spriteHeight;
                var context = sprite.getContext("2d");
                context.drawImage(
                // source image
                    image,
                // source x
                    ii * spriteWidth,
                // source y
                    0,
                // source width
                    spriteWidth,
                // source height
                    spriteHeight,
                // target x
                    0,
                //target y
                    0,
                // target width
                    spriteWidth,
                // target height
                    spriteHeight);
                snowflakeSprites.push(sprite);
            }

            if (number) {
                snowflakesDefaultCount = number;
            }
            if (!add) {
                snowflakes = [];
            }
            for (var ii = 0; ii < snowflakesDefaultCount; ii++) {
                snowflakes.push(generateSnowflake());
            }
        }
        image.src = snowflakeSpritesLocation;
    }

    function generateSnowflake() {
        var scale = Math.random() * (maxScale - minScale) + minScale;
        return {
            // x position
            x: Math.random() * bounds.width,
            // y position
            y: Math.random() * bounds.height,
            // vertical velocity
            vv: Math.random() * (maxVerticalVelocity - minVerticalVelocity) + minVerticalVelocity,
            // horizontal velocity
            hv: Math.random() * (maxHorizontalVelocity - minHorizontalVelocity) + minHorizontalVelocity,
            // scaled sprite width
            sw: scale * spriteWidth,
            // scaled sprite width
            sh: scale * spriteHeight,
            // maximum horizontal delta
            mhd: Math.random() * (maxHorizontalDelta - minHorizontalDelta) + minHorizontalDelta,
            // horizontal delta
            hd: 0,
            // horizontal delta increment
            hdi: Math.random() / (maxHorizontalVelocity * minHorizontalDelta),
            // opacity
            o: Math.random() * (maxOpacity - minOpacity) + minOpacity,
            // opacity increment
            oi: Math.random() / maxOpacityIncrement,
            // sprite index
            si: Math.ceil(Math.random() * (spritesCount - 1)),
            // not landing flag
            nl: false
        }
    }

    // check if snowflake is within bounds of postcard
    function isWithinPostcard(x, y) {
        if (x < landingBounds.left) return false;
        if (y < landingBounds.top) return false;
        if (x > landingBounds.right) return false;
        if (y > landingBounds.bottom) return false;
        return true;
    }

    // grow the snowHeap
    function progressHeapSize() {
        if (heapSize >= maxHeapSize) return;
        heapSize += heapSizeIncrement * speedFactor;
        snowHeap.style.height = heapSize * 100 + "%";
    }

    // help snowflakes fall
    function advanceSnowFlakes() {
        progressHeapSize();
        for (var ii = 0; ii < snowflakes.length; ii++) {
            var sf = snowflakes[ii];
            // we obey the gravity, 'cause it's the law
            sf.y += sf.vv * speedFactor;
            // while we're obeying the gravity, we do it with style
            sf.x += (sf.hd + sf.hv) * speedFactor;
            // advance horizontal axis "bobbing"
            sf.hd += sf.hdi;
            // inverse "bobbing" direction if we get to maximum delta limit
            if (sf.hd < -sf.mhd || sf.hd > sf.mhd) {
                sf.hdi = -sf.hdi;
            };

            // increment opacity and check opacity value bounds
            sf.o += sf.oi;
            if (sf.o > maxOpacity || sf.o < minOpacity) { sf.oi = -sf.oi };
            if (sf.o > maxOpacity) sf.o = maxOpacity;
            if (sf.o < minOpacity) sf.o = minOpacity;
            // return within dimensions bounds if we've crossed them
            // and don't forget to reset the not-landing (sf.nl) flag
            var resetNotLanding = false;
            if (sf.y > bounds.height + spriteHeight / 2) {
                sf.y = 0
                resetNotLanding = true;
            };
            if (sf.y < 0) {
                sf.y = bounds.height
                resetNotLanding = true;
            };
            if (sf.x > bounds.width + spriteWidth / 2) {
                sf.x = 0
                resetNotLanding = true;
            };
            if (sf.x < 0) {
                sf.x = bounds.width
                resetNotLanding = true;
            };
            if (resetNotLanding) { sf.nl = false; }

            // try probable landing
            if (!sf.nl && isWithinPostcard(sf.x, sf.y)) {
                // if within postcard - try if it should land
                var chance = Math.random();
                if (chance < landingProbability) {
                    // leave a snowmark at random position
                    SnowPostcard.addSnowmark(
                        Math.random() * landingBounds.width,
                        Math.random() * landingBounds.height,
                        snowflakeSprites[sf.si]);
                    //
                    sf.y = 0;
                    sf.x = Math.random() * bounds.width;
                } else {
                    sf.nl = true;
                }
            }
        }
    }

    // not using, but it allows to increase/decrease speed based on fps
    // in essence - visual feedback on fps value
    function adjustSpeedFactor() {
        if (++currentSpeedCorrectionFrame === speedCorrectionFrames) {
            var lastFps = SystemInformation.getLastFps();
            var targetSpeedFactor = (lastFps * (maxSpeedFactor - minSpeedFactor) / 60) + minSpeedFactor;
            speedFactor += (targetSpeedFactor < speedFactor) ? -speedFactorDelta : speedFactorDelta;
            if (speedFactor > maxSpeedFactor) { speedFactor = maxSpeedFactor; }
            if (speedFactor < minSpeedFactor) { speedFactor = minSpeedFactor; }
            currentSpeedCorrectionFrame = 0;
        }
    }

    function renderFrame(context) {
        // fall down one iteration
        advanceSnowFlakes();
        // clear context and save it
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        for (var ii = 0; ii < snowflakes.length; ii++) {
            var sf = snowflakes[ii];
            context.globalAlpha = sf.o;
            context.drawImage(
                // image
                snowflakeSprites[sf.si],
                // source x
                0,
                // source y
                0,
                // source width
                spriteWidth,
                // source height
                spriteHeight,
                // target x
                sf.x,
                // target y
                sf.y,
                // target width
                sf.sw,
                // target height
                sf.sh);
        }
    }

    function updateBounds() {
        bounds.width = window.innerWidth;
        bounds.height = window.innerHeight;
        landingBounds = SnowPostcard.updateBounds();
    }

    function count() {
        return snowflakes.length;
    }

    // increase number of falling snowflakes
    // the default increase is snowflakeCountIncrement
    function add(number) {
        if (!number) { number = snowflakes.length * snowflakeCountIncrement; }
        generate(number, true);
    }

    // remove some snowflakes
    // by default we remove more aggressively to free resources faster
    function remove(number) {
        if (!number) { number = snowflakes.length * snowflakeCountIncrement * snowflakeRemoveFactor; }
        if (snowflakes.length - number > 0) {
            snowflakes = snowflakes.slice(0, snowflakes.length - number);
        }
    }

    return {
        "generate": generate,
        "add": add,
        "remove": remove,
        "render": renderFrame,
        "count": count,
        "updateBounds": updateBounds,
        "dynamicSnowflakesCount": dynamicSnowflakesCount
    }

})();
