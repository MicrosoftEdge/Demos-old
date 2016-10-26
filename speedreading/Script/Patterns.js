
/* --------------------------------------------------------------------- Patterns --- */

function BillboardPatterns() {



    // Start at the same time.
    this.StartAtSameTime = function () {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = 0;
            }
        }
    }



    // Cascade from the first character to the last character.
    this.FirstToLastCascade = function (step) {
        for (i = 0; i < billboard.Tiles.length; i++) {
            billboard.Tiles[i].initialDelay = Math.ceil(i / step);
        }
    }



    // Cascade from the last character to the first character.
    this.LastToFirstCascade = function () {
        var delay = billboard.Tiles.length;
        for (i = 0; i < billboard.Tiles.length; i++) {
            billboard.Tiles[i].initialDelay = delay;
            delay--;
        }
    }



    // Cascade from the left characters to the right characters.
    this.LeftToRightCascade = function () {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = x;
            }
        }
    }



    // Cascade from the right characters to the left characters.
    this.RightToLeftCascade = function () {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = COUNT_HORIZONTAL_TILES - x;
            }
        }
    }



    // Cascade from the right characters to the left characters.
    this.TopToBottomCascade = function (step) {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = y * step;
            }
        }
    }



    // Cascade from the bottom characters to the top characters.
    this.BottomToTopCascade = function () {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = (COUNT_VERTICAL_TILES - y) * 3;
            }
        }
    }



    // Cascade from top left corner to bottom right.
    this.TopLeftToBottomRightCascade = function () {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = Math.max(x,y);
            }
        }
    }


    // Cascade randomly.
    this.Random = function (max) {
        for (x = 0; x < COUNT_HORIZONTAL_TILES; x++) {
            for (y = 0; y < COUNT_VERTICAL_TILES; y++) {
                billboard.Tiles[x + (COUNT_HORIZONTAL_TILES * y)].initialDelay = Math.floor(Math.random() * max);
            }
        }
    }


}