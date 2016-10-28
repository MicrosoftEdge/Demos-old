

/* -------------------------------------------------------------- Billboard Class --- */

function Billboard() {

    this.Tiles;
    this.currentMessage = "";
    this.countTilesStillAnimating = 0;
    this.patterns = new BillboardPatterns();
    this.messages = new BillboardMessages();
    this.compositeWhenAvailable;

    this.paddingTop = 120;
    this.paddingEdge = 0;
    this.paddingMinimumEdge = 120;
    this.paddingMinimumBottom = 110;

    this.defaultTileWidth = 68;
    this.defaultTileHeight = 88;
    this.defaultHorizontalTilePadding = 2;
    this.defaultVerticalTilePadding = 1;

    this.currentTileWidth = 0;
    this.currentTileHeight = 0;
    this.currentHorizontalTilePadding = 0;
    this.currentVerticalTilePadding = 0;

    this.billboardTop;
    this.billboardLeft;
    this.billboardWidth;
    this.billboardHeight;
    this.billboardReflectionTop;

    this.startButtonTop;
    this.startButtonLeft;
    this.startButtonWidth;
    this.startButtonHeight;

    this.sndFlipRepeat;
    this.sndFlipSingle;


    // Initialize the Class
    this.Initialize = function () {

        this.sndFlipRepeat = document.getElementById('SoundFlipRepeat');
        this.sndFlipRepeat.loop = true;
        this.sndFlipRepeat.volume = 0;

        this.sndFlipSingle = document.getElementById('SoundFlipSingle');
        this.sndFlipSingle.loop = false;
        this.sndFlipSingle.volume = 0.8;

        var count = COUNT_HORIZONTAL_TILES * COUNT_VERTICAL_TILES;

        this.Tiles = new Array();
        for (var i = 0; i < count; i++) {
            this.Tiles.push(new Tile());
        }

        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                this.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].Initialize();
            }
        }

        this.SetTileSizes();
    }



    // Size and position the tiles and shadows on the billboard.
    this.SetTileSizes = function () {

        if (surfaceWidth > ((COUNT_HORIZONTAL_TILES * (this.defaultTileWidth + this.defaultHorizontalTilePadding)) + this.paddingMinimumEdge * 2)) {
            this.currentTileWidth = this.defaultTileWidth;
            this.currentHorizontalTilePadding = this.defaultHorizontalTilePadding;
            this.paddingEdge = (surfaceWidth - (COUNT_HORIZONTAL_TILES * (this.defaultTileWidth + this.defaultHorizontalTilePadding))) / 2;
        }
        else {
            this.paddingEdge = this.paddingMinimumEdge;
            this.currentTileWidth = ((surfaceWidth - (this.paddingEdge * 2)) / COUNT_HORIZONTAL_TILES) * 0.97;
            this.currentHorizontalTilePadding = (surfaceWidth - (this.currentTileWidth * COUNT_HORIZONTAL_TILES) - (this.paddingEdge * 2)) / (COUNT_HORIZONTAL_TILES - 1);
        }

        if (surfaceHeight > ((COUNT_VERTICAL_TILES * (this.defaultTileHeight + this.defaultVerticalTilePadding)) + this.paddingTop + this.paddingMinimumBottom)) {
            this.currentTileHeight = this.defaultTileHeight;
            this.currentVerticalTilePadding = this.defaultVerticalTilePadding;
        }
        else {
            this.currentTileHeight = ((surfaceHeight - this.paddingTop - this.paddingMinimumBottom) / COUNT_VERTICAL_TILES) * 0.98;
            this.currentVerticalTilePadding = ((surfaceHeight - this.paddingTop - this.paddingMinimumBottom) - (this.currentTileHeight * COUNT_VERTICAL_TILES)) / (COUNT_VERTICAL_TILES - 1);
        }

        // Position the billboard background.
        this.billboardWidth = (((this.currentTileWidth + this.currentHorizontalTilePadding) * COUNT_HORIZONTAL_TILES) - this.currentHorizontalTilePadding) * 1.41641938;
        this.billboardHeight = (((this.currentTileHeight + this.currentVerticalTilePadding) * COUNT_VERTICAL_TILES) - this.currentVerticalTilePadding) * 1.41598694;
        this.billboardTop = this.paddingTop - (this.billboardHeight * 0.147465437);
        this.billboardLeft = (surfaceWidth - this.billboardWidth) / 2;
        this.billboardReflectionTop = this.paddingTop + (((this.currentTileHeight + this.currentVerticalTilePadding) * COUNT_VERTICAL_TILES) - this.currentVerticalTilePadding);
        this.billboardWidth = this.billboardWidth + 5;
        this.billboardHeight = this.billboardHeight + 7;
        this.billboardTop = this.billboardTop - 3;
        this.billboardLeft = this.billboardLeft - 3;

        // Position the try it button.
        this.startButtonLeft = (9 * (this.currentTileWidth + this.currentHorizontalTilePadding)) + this.paddingEdge + (this.currentTileWidth * 0.20);
        this.startButtonTop = (4 * (this.currentTileHeight + this.currentVerticalTilePadding)) + this.paddingTop + (this.currentTileHeight * 0.67);
        this.startButtonWidth = this.currentTileWidth / this.defaultTileWidth * 400;
        this.startButtonHeight = this.currentTileHeight / this.defaultTileHeight * 70;

        // Position the tiles.
        var currentX = 0;
        var currentY = 0;
        var count = COUNT_HORIZONTAL_TILES * COUNT_VERTICAL_TILES;

        var x, y, w, h;
        for (var i = 0; i < count; i++) {

            x = (currentX * (this.currentTileWidth + this.currentHorizontalTilePadding)) + this.paddingEdge;
            y = (currentY * (this.currentTileHeight + this.currentVerticalTilePadding)) + this.paddingTop;
            w = this.currentTileWidth;
            h = this.currentTileHeight;

            this.Tiles[i].SetSize(x, y, w, h);

            currentX++;

            if (currentX == COUNT_HORIZONTAL_TILES) {
                currentX = 0;
                currentY++;
            }
        }

        // Position the shadows.
        currentX = COUNT_HORIZONTAL_TILES - 1;
        currentY = 0;
        count = COUNT_HORIZONTAL_TILES * COUNT_VERTICAL_TILES;
        var shadowStart = (COUNT_VERTICAL_TILES * (this.currentTileHeight + this.currentVerticalTilePadding)) + 6;

        var x, y, w, h;
        for (var i = count - 1; i >= 0; i--) {

            x = (currentX * (this.currentTileWidth + this.currentHorizontalTilePadding)) + this.paddingEdge;
            y = (currentY * (this.currentTileHeight + this.currentVerticalTilePadding)) + this.paddingTop + shadowStart;
            w = this.currentTileWidth;
            h = this.currentTileHeight;

            this.Tiles[i].SetShadowSize(x, y, w, h);
            this.Tiles[i].SetShadowAlphaLevel(currentY);

            currentX--;

            if (currentX == -1) {
                currentX = COUNT_HORIZONTAL_TILES - 1;
                currentY++;
            }
        }


    }



    // Register for a callback when the billboard animation is complete.
    this.callbackFunction = function () { alert("ASSERT: callback function was not properly set") };
    this.sendCallback = false;
    this.callbackDuration = 0;
    this.RegisterCallback = function (func) {
        this.callbackFunction = func;
        this.sendCallback = true;
    }



    // Change the billboard sequence.
    this.ApplyBillboardSequence = function (sequence) {

        this.currentMessage = sequence.message;
        this.animateOnlyChanges = sequence.changes;
        this.compositeWhenAvailable = sequence.composite;
        this.RegisterCallback(sequence.callback);
        eval(sequence.pattern);

        for (i = 0; i < this.currentMessage.length; i++) {
            this.Tiles[i].SetDestinationCharacter(this.currentMessage.charAt(i));
            this.Tiles[i].includeBlanks = sequence.blanks;
            this.Tiles[i].includeNumbers = sequence.numbers;
            this.Tiles[i].includeSymbols = sequence.symbols;
            this.Tiles[i].includeUppercase = sequence.upper;
            this.Tiles[i].includeLowercase = sequence.lower;
            this.Tiles[i].loop = sequence.loops;
        }

        this.BeginAnimating();
        StartDrawing();
    }



    // Begin animating the tiles on the billboard.
    this.BeginAnimating = function () {

        if (repeatSound == true) {
            try {
                this.sndFlipRepeat.play();
            } catch (e) {
            }
        }

        for (i = 0; i < this.Tiles.length; i++) {

            if ((this.Tiles[i].currentChar != this.Tiles[i].destinationChar) || (this.animateOnlyChanges == false)) {
                this.Tiles[i].SetNextCharacter();
                this.Tiles[i].animating = true;
            }
        }
    }



    // Draw the billboard.
    this.Draw = function () {

        // Draw the billboard and its reflection.
        surface.drawImage(imgBillboardReflection, this.billboardLeft, this.billboardReflectionTop, this.billboardWidth, this.billboardHeight);
        surface.drawImage(imgBillboardBackground, this.billboardLeft, this.billboardTop, this.billboardWidth, this.billboardHeight);

        // Draw the tiles on the billboard.
        this.countTilesStillAnimating = 0;
        for (var i in this.Tiles) {
            this.Tiles[i].Draw();
        }

        if (repeatSound == true) {
            this.sndFlipRepeat.volume = this.countTilesStillAnimating / 96;
            this.sndFlipRepeat.volume = (this.sndFlipRepeat.volume < 0.10) ? 0.10 : this.sndFlipRepeat.volume;
            this.sndFlipRepeat.volume = (this.sndFlipRepeat.volume > 0.85) ? 0.85 : this.sndFlipRepeat.volume;
        }

        if (this.sendCallback && this.countTilesStillAnimating == 0) {

            if (repeatSound == true) {
                try {
                    this.sndFlipRepeat.pause();
                } catch (e) {
                }
            }
            StopDrawing();
            this.sendCallback = false;
            eval(this.callbackFunction);
        }
    }

}



/* ------------------------------------------------------------ Billboard Sequence --- */

function BillboardSequence(message, changes, blanks, numbers, symbols, upper, lower, loops, composite, pattern, callback, duration) {
    this.message = message;
    this.changes = changes;
    this.blanks = blanks;
    this.numbers = numbers;
    this.symbols = symbols;
    this.upper = upper;
    this.lower = lower;
    this.loops = loops;
    this.composite = composite;
    this.pattern = pattern;
    this.callback = callback;
    this.callbackDuration = duration;
}