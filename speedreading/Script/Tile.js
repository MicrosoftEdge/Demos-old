

/* --------------------------------------------------------------------- Tile Class --- */


function Tile() {

    this.left = 0;
    this.top = 0;
    this.width = 0;
    this.height = 0;

    this.shadowLeft = 0;
    this.shadowTop = 0;
    this.shadowWidth = 0;
    this.shadowHeight = 0;

    this.shadowAlpha = 1;
    this.shadowBaseAlpha = 0.132;
    this.shadowMultiplier = 0.038;

    this.currentChar = 0;
    this.nextChar = 0;
    this.destinationChar = 0;

    this.animating = false;
    this.animationStage = 1;
    this.initialDelay = 0;
    this.loop = 1;

    this.includeBlank = true;
    this.includeNumbers = true;
    this.includeSymbols = true;
    this.includeUppercase = true;
    this.includeLowercase = true;

    this.countAnimationSteps = 8;
    this.animationStagesTop = [0, 16, 27, 38, 46, 49, 49, 49, 49, 0, 0];
    this.animationStagesHeight = [0, 36, 25, 15, 7, 2, 16, 29, 42, 0, 0];



    // Initialize the tile.
    this.Initialize = function () {
    }



    // Set the size of the tile.
    this.SetSize = function (left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }



    // Set the size of the tile.
    this.SetShadowSize = function (left, top, width, height) {
        this.shadowLeft = left;
        this.shadowTop = top;
        this.shadowWidth = width;
        this.shadowHeight = height;
    }



    // Set the alpha level of the tile.
    this.SetShadowAlphaLevel = function (level) {
        this.shadowAlpha = this.shadowBaseAlpha - (this.shadowMultiplier * level);
        this.shadowAlpha = (this.shadowAlpha < 0) ? 0.02 : this.shadowAlpha;
    }



    // Set the destination character we should flip toward.
    this.SetDestinationCharacter = function (char) {

        if (char == "~") {
        }
        else if (char == " ") {
            this.destinationChar = 0;
        }
        else if (char == ".") {
            this.destinationChar = 76;
        }
        else if (char == "-") {
            this.destinationChar = 77;
        }
        else {
            this.destinationChar = char.charCodeAt(0) - 47;
        }

    }



    // Set the next character that we should flip to, factoring in which characters are enabled.
    this.SetNextCharacter = function () {

        // On high end CPU and GPU combinations we can compose so many characters that you don't see
        // the animation. Cap the animation ao 10 character steps even if we could compose more characters.
        var additional = (composite == true && billboard.compositeWhenAvailable == true) ? Math.floor((perf.animationSteps / this.countAnimationSteps)) : 0;
        additional = (additional > 10) ? 10 : additional;

        this.nextChar = (this.currentChar + 1 == NUMBER_CHARACTERS) ? 0 : this.currentChar + 1;

        var hit = true;
        while (hit == true) {

            hit = false;

            if (this.includeBlank == false && this.nextChar == 0) {
                this.nextChar = 1;
                hit = true;
            }

            if (this.includeNumbers == false && this.nextChar == 1) {
                this.nextChar = 11;
                hit = true;
            }

            if (this.includeSymbols == false && this.nextChar == 11) {
                this.nextChar = 18;
                hit = true;
            }

            if (this.includeUppercase == false && this.nextChar == 18) {
                this.nextChar = 44;
                hit = true;
            }

            if (this.includeSymbols == false && this.nextChar == 44) {
                this.nextChar = 50;
                hit = true;
            }

            if (this.includeLowercase == false && this.nextChar == 50) {
                this.nextChar = 76;
                hit = true;
            }

            if (this.includeSymbols == false && this.nextChar == 76) {
                this.nextChar = 0;
                hit = true;
            }

            if (hit == false && additional > 0 && this.nextChar != this.destinationChar) {
                this.nextChar = (this.nextChar + 1 == NUMBER_CHARACTERS) ? 0 : this.nextChar + 1;
                additional--;
                hit = true;
            }

        }
    }



    // Draw the tile including the current visible characters.
    this.Draw = function () {

        // Reset the character image strip.
        imgChar = imgCharBase;

        // Account for the initial delay.
        if (this.initialDelay > 0) {
            this.initialDelay--;
        }

        // Keep track of how many tiles are still animating.
        if (this.animating == true) {
            billboard.countTilesStillAnimating++;
        }

        // Draw the base tile.
        surface.globalAlpha = 1;
        surface.drawImage(imgTile, 0, 0, 70, 100, this.left, this.top, this.width, this.height);

        // If animating draw the current state, otherwise draw the fill tile.
        if (this.animating == true && this.initialDelay == 0) {

            this.DrawPartialCharacter();
            this.DrawShadow();
            this.IncrimentAnimationStage();

            if (composite == true && billboard.compositeWhenAvailable == true) {
                imgChar = imgCharSpinning;
                var x = 5;
                while (x > 0) {
                    this.DrawPartialCharacter();
                    this.IncrimentAnimationStage();
                    x--;
                }
            }

        }
        else {

            surface.drawImage(imgTile, 0, 0, 70, 100, this.left, this.top, this.width, this.height);
            surface.drawImage(imgChar, (this.currentChar * 70), 0, 70, 50, this.left, this.top, this.width, this.height / 2);
            surface.drawImage(imgChar, (this.currentChar * 70), 50, 70, 50, this.left, this.top + (this.height / 2), this.width, this.height / 2);
            surface.globalAlpha = 0.75;
            surface.drawImage(imgTile, 700, 0, 70, 100, this.left, this.top, this.width, this.height);
            surface.globalAlpha = 1.0;

            surface.globalAlpha = this.shadowAlpha;
            surface.drawImage(imgTileFlipped, 0, 0, 70, 100, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight);
            surface.drawImage(imgCharFlipped, (this.currentChar * 70), 0, 70, 50, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight / 2);
            surface.drawImage(imgCharFlipped, (this.currentChar * 70), 50, 70, 50, this.shadowLeft, this.shadowTop + (this.shadowHeight / 2), this.shadowWidth, this.shadowHeight / 2);
            surface.globalAlpha = 1.0;
        }

    }



    // Draw the animation over the tile.
    this.DrawPartialCharacter = function () {

        surface.globalAlpha = (composite == true && billboard.compositeWhenAvailable == true) ? 0.8 : 1.0;
        surface.drawImage(imgChar, (this.nextChar * 70), 0, 70, 50, this.left, this.top, this.width, this.height / 2);
        surface.drawImage(imgChar, (this.currentChar * 70), 50, 70, 50, this.left, this.top + (this.height / 2), this.width, this.height / 2);

        surface.globalAlpha = (composite == true && billboard.compositeWhenAvailable == true) ? 0.2 : 1.0;
        surface.drawImage(imgTile, this.animationStage * 70, 0, 70, 100, this.left, this.top, this.width, this.height);

        surface.globalAlpha = (composite == true && billboard.compositeWhenAvailable == true) ? 0.7 : 1.0;
        if (this.animationStage < 5) {
            surface.drawImage(imgChar, (this.currentChar * 70), 0, 70, 50, this.left, this.top + (this.height * this.animationStagesTop[this.animationStage] / 100), this.width, this.height * this.animationStagesHeight[this.animationStage] / 100);
        }
        else {
            surface.drawImage(imgChar, (this.nextChar * 70), 50, 70, 50, this.left, this.top + (this.height * this.animationStagesTop[this.animationStage] / 100), this.width, this.height * this.animationStagesHeight[this.animationStage] / 100);
        }

        // If we've fully animated the character draw the final state.
        if (this.animationStage > 8) {
            surface.globalAlpha = (composite == true && billboard.compositeWhenAvailable == true) ? 0.1 : 1.0;
            surface.drawImage(imgTile, 0, 0, 70, 100, this.left, this.top, this.width, this.height);
            surface.globalAlpha = (composite == true && billboard.compositeWhenAvailable == true) ? 1.0 : 1.0;
            surface.drawImage(imgChar, (this.nextChar * 70), 0, 70, 50, this.left, this.top, this.width, this.height / 2);
            surface.drawImage(imgChar, (this.nextChar * 70), 50, 70, 50, this.left, this.top + (this.height / 2), this.width, this.height / 2);

            if (repeatSound == false) {
                try {
                    billboard.sndFlipSingle.play();
                } catch (e) {
                }
            }
        }

        // Draw the screws on the flipboard.
        surface.globalAlpha = 0.7;
        surface.drawImage(imgTile, 700, 0, 70, 100, this.left, this.top, this.width, this.height);

        // Ensure the global alpha is restored before leaving.
        surface.globalAlpha = 1.0;
    }



    // Draw the shadow over the tile.
    this.DrawShadow = function () {

        surface.globalAlpha = this.shadowAlpha;
        surface.drawImage(imgTileFlipped, 0, 0, 70, 100, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight);
        surface.drawImage(imgCharFlipped, (this.nextChar * 70), 50, 70, 50, this.shadowLeft, this.shadowTop + (this.shadowHeight / 2), this.shadowWidth, this.shadowHeight / 2);
        surface.drawImage(imgCharFlipped, (this.currentChar * 70), 0, 70, 50, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight / 2);
        surface.drawImage(imgTileFlipped, this.animationStage * 70, 0, 70, 100, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight);

        if (this.animationStage < 5) {
            surface.drawImage(imgCharFlipped, (this.currentChar * 70), 50, 70, 50, this.shadowLeft, this.shadowTop + (this.shadowHeight / 2) - 1, this.shadowWidth, this.shadowHeight * this.animationStagesHeight[this.animationStage] / 100);
        }
        else {
            surface.drawImage(imgCharFlipped, (this.nextChar * 70), 0, 70, 50, this.shadowLeft, this.shadowTop + (this.shadowHeight / 2) - this.shadowHeight * this.animationStagesHeight[this.animationStage] / 100, this.shadowWidth, this.shadowHeight * this.animationStagesHeight[this.animationStage] / 100);
        }

        // If we've fully animated the character draw the final state.
        if (this.animationStage > 8) {
            surface.drawImage(imgTileFlipped, 0, 0, 70, 100, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight);
            surface.drawImage(imgCharFlipped, (this.nextChar * 70), 0, 70, 50, this.shadowLeft, this.shadowTop, this.shadowWidth, this.shadowHeight / 2);
            surface.drawImage(imgCharFlipped, (this.nextChar * 70), 50, 70, 50, this.shadowLeft, this.shadowTop + (this.shadowHeight / 2), this.shadowWidth, this.shadowHeight / 2);
        }
        surface.globalAlpha = 1.0;

    }



    // Draw the animation over the tile.
    this.IncrimentAnimationStage = function () {

        this.animationStage++;

        // If we've fully animated the character move to the next phase.
        if (this.animationStage > 9) {

            // Reset the animation.
            this.animationStage = 1;

            // Set the current and next characters now that we're complete.
            this.currentChar = this.nextChar;
            this.SetNextCharacter();

            // If we're now on the destination character we either need to loop or stop animating.
            if (this.currentChar == this.destinationChar) {
                if (this.loop > 0) {
                    this.loop--;
                }
                else {
                    this.animating = false;
                }
            }
        }

    }
}

