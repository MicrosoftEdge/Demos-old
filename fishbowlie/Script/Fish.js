function Fish() {

    this.MAX_SIZE = 52;
    this.MIN_SIZE = 16;
    this.MAX_BOTTOM_BOUNCES = 10;
    this.MAX_ENTRY_DIAMETER = 1;

    this.context = null;

    this.x;
    this.y;
    this.width;
    this.height;
    this.horizontalDirection;
    this.verticalDirection;
    this.flutterDirection;
    this.flutterIndex;
    this.horizontalSpeed;
    this.targetHorizontalSpeed;
    this.verticalSpeed;
    this.targetVerticalSpeed;
    this.falling;
    this.decelerating;
    this.flipping;
    this.flippingPosition;
    this.bottomBounces;
    this.rotation;
    this.targetRotation;


    this.Draw = function () {

        // Flipping after bouncing against a wall.
        if (this.flipping == true) {

            this.x = (this.horizontalDirection == 1) ? this.x += fishBowl.fishBowlWidth * 0.01 : this.x -= fishBowl.fishBowlWidth * 0.01;

            // Draw the flipping fish.
            fishBowl.context.save();
            fishBowl.context.translate(fishBowl.centerX + this.x, fishBowl.centerY + this.y);
            fishBowl.context.scale(this.horizontalDirection, 1);
            fishBowl.context.globalAlpha = (this.width / (this.MAX_SIZE * 2)) * 0.6;
            fishBowl.context.drawImage(imgFish, 400 * 12, 0, 400, 400, -this.width, -this.height, this.width * 2, this.height * 2);
            fishBowl.context.restore();

            this.flipping = false;
            this.horizontalDirection = (this.horizontalDirection == 1) ? -1 : 1;
            this.x = (this.horizontalDirection == 1) ? this.x -= this.horizontalSpeed * fishBowl.fishBowlSpeed : this.x += this.horizontalSpeed * fishBowl.fishBowlSpeed;
        }

        // Swimming back and forth.
        else {

            // Flutter
            this.flutterIndex = (this.flutterDirection == 1) ? this.flutterIndex + 1 : this.flutterIndex - 1;
            if (this.flutterIndex == 11) this.flutterDirection = 0;
            if (this.flutterIndex == 0) this.flutterDirection = 1;

            // Horizontal
            var hOffset = (this.y > 0) ? fishBowl.lowerHOffsets[Math.round(10 * (((this.y) + this.height + this.verticalSpeed) / fishBowl.fishBowlMaxY))] * fishBowl.fishBowlMaxX : fishBowl.upperHOffsets[Math.round(10 * ((this.y - this.height - this.verticalSpeed) / -fishBowl.fishBowlMaxY))] * fishBowl.fishBowlMaxX;

            if (this.horizontalDirection == 1) {
                this.x += this.horizontalSpeed * fishBowl.fishBowlSpeed;
                var maxX = fishBowl.fishBowlMaxX - hOffset - this.width;
                if (this.x > maxX) {
                    this.x = maxX;
                    this.flipping = true;
                }
            }
            else {
                this.x -= this.horizontalSpeed * fishBowl.fishBowlSpeed;
                var maxX = -fishBowl.fishBowlMaxX + hOffset + this.width;
                if (this.x < maxX) {
                    this.x = maxX;
                    this.flipping = true;
                }
            }

            // Vertical
            var vOffset = (this.y > 0) ? fishBowl.lowerVOffsets[Math.round(10 * ((Math.abs(this.x) + this.width) / fishBowl.fishBowlMaxX))] * fishBowl.fishBowlMaxX : fishBowl.upperVOffsets[Math.round(10 * ((Math.abs(this.x) + this.width) / fishBowl.fishBowlMaxX))] * fishBowl.fishBowlMaxX;

            if (this.verticalDirection == 1) {
                this.y += this.verticalSpeed * fishBowl.fishBowlSpeed;
                var maxY = fishBowl.fishBowlMaxY - vOffset - this.height;
                if (this.y > maxY) {
                    if (this.y > fishBowl.fishBowlMaxY * 0.95) {
                        this.verticalDirection = -1;
                        this.ChangeSpeed();
                        this.bottomBounces = 0;
                    }
                    else {
                        this.y -= this.verticalSpeed * 0.99;
                        this.bottomBounces++;
                    }

                    if (this.bottomBounces > this.MAX_BOTTOM_BOUNCES) {
                        this.verticalDirection = -1;
                        this.ChangeSpeed();
                        this.bottomBounces = 0;
                    }
                }
            }
            else {
                this.y -= this.verticalSpeed * fishBowl.fishBowlSpeed;
                var maxY = -fishBowl.fishBowlMaxY + vOffset + this.height;
                if (this.y < maxY) {
                    this.verticalDirection = 1;
                    this.ChangeSpeed();
                }
            }

            if (this.flipping == false) {
                if ((Math.random() * (400 * fishBowl.fishBowlSpeed)) < 1) {
                    this.flipping = true;
                }

                if ((Math.random() * 220) < 1) {
                    this.ChangeSpeed();
                }

            }

            this.horizontalSpeed += (this.targetHorizontalSpeed - this.horizontalSpeed) * 0.04491 * fishBowl.fishBowlSpeed;
            this.verticalSpeed += (this.targetVerticalSpeed - this.verticalSpeed) * 0.9874 * fishBowl.fishBowlSpeed;

            if (this.verticalDirection == 1 && this.rotation < this.targetRotation) {
                this.rotation += (this.targetRotation - this.rotation) * 0.06851614 * fishBowl.fishBowlSpeed;
            }
            else if (this.verticalDirection == -1 && this.rotation > this.targetRotation) {
                this.rotation -= (this.rotation - this.targetRotation) * 0.08516147 * fishBowl.fishBowlSpeed;
            }

            // Draw Fish
            fishBowl.context.save();
            fishBowl.context.translate(fishBowl.centerX + this.x, fishBowl.centerY + this.y);
            fishBowl.context.scale(this.horizontalDirection, 1);
            fishBowl.context.rotate(this.rotation);
            fishBowl.context.globalAlpha = (this.width / (this.MAX_SIZE * 1.90174851));
            fishBowl.context.drawImage(imgFish, 400 * this.flutterIndex, 0, 400, 400, -this.width, -this.height, this.width * 2, this.height * 2);
            fishBowl.context.restore();

        }
    };

    this.ChangeSpeed = function () {
        this.targetHorizontalSpeed = (Math.random() * 8) + Math.random();
        this.targetVerticalSpeed = (Math.random() * 2) + Math.random();
        this.targetRotation = this.CalculateTargetRotation();
    }

};


Fish.prototype.InitializeFixed = function () {
    this.x = 0;
    this.y = 0;
    this.width = 50;
    this.height = 50;
    this.horizontalDirection = 1;
    this.verticalDirection = 1;
    this.flutterDirection = 1;
    this.flutterIndex = 0;
    this.horizontalSpeed = 6;
    this.targetHorizontalSpeed = 6;
    this.verticalSpeed = 0.6;
    this.targetVerticalSpeed = 0.6;
    this.falling = false;
    this.decelerating = false;
    this.bottomBounces = 0;
    this.rotation = 0;
    this.targetRotation = this.CalculateTargetRotation();
};


Fish.prototype.InitializeRandom = function () {
    this.x = (Math.random() * fishBowl.fishBowlMaxX * this.MAX_ENTRY_DIAMETER) - (fishBowl.fishBowlMaxX * this.MAX_ENTRY_DIAMETER * 0.5);
    this.y = (Math.random() * fishBowl.fishBowlMaxY * this.MAX_ENTRY_DIAMETER) - (fishBowl.fishBowlMaxY * this.MAX_ENTRY_DIAMETER * 0.5);
    this.width = (Math.random() * this.MAX_SIZE) + this.MIN_SIZE;
    this.height = this.width - (Math.random() * 3);
    this.horizontalDirection = (Math.round(Math.random()) > 0.5) ? 1 : -1;
    this.verticalDirection = (Math.round(Math.random()) > 0.5) ? 1 : -1;
    this.flutterDirection = 1;
    this.flutterIndex = Math.round(Math.random() * 8);
    this.horizontalSpeed = (Math.random() * 8) + Math.random();
    this.targetHorizontalSpeed = this.horizontalSpeed;
    this.verticalSpeed = (Math.random() * 2) + Math.random();
    this.targetVerticalSpeed = this.verticalSpeed;
    this.falling = false;
    this.decelerating = false;
    this.bottomBounces = 0;
    this.rotation = 0;
    this.targetRotation = 0.5;
    this.targetRotation = this.CalculateTargetRotation();
};


Fish.prototype.CalculateTargetRotation = function () {
    var factor = this.verticalSpeed / this.horizontalSpeed;

    if (this.verticalDirection == 1) {
        return (Math.min((factor * 0.24), 0.35));
    }
    else {
        return (Math.max((factor * -0.28), -0.5));
    }

};

