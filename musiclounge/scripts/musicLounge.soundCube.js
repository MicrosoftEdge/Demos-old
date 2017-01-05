var MusicLounge;
(function (MusicLounge) {
    var SoundCube = (function () {
        function SoundCube(name, position, scene, color, shadowGenerator, attachedSound) {
            var _this = this;
            this._flyHeight = 3;
            this._magnetizeDistance = 25;
            this._boxSize = 20;
            this._scene = scene;
            this._box = BABYLON.Mesh.CreateBox(name, this._boxSize, scene);
            this._material = new BABYLON.StandardMaterial(name + ' material', this._scene);
            this._material.diffuseColor = color;
            var diffuseTexture = new BABYLON.Texture('assets/flare.png', scene);
            diffuseTexture.hasAlpha = true;
            diffuseTexture.uScale = 0.5;
            diffuseTexture.vScale = 0.5;
            this._material.diffuseTexture = diffuseTexture;
            this._material.specularColor = color;
            this._material.emissiveColor = color.scale(0.5);
            this._box.material = this._material;
            this._box.position = position;
            this._box.checkCollisions = true;
            this._box.ellipsoid = new BABYLON.Vector3(this._boxSize / 2, 1, this._boxSize / 2);
            this._name = name;
            this._originHeight = this._box.position.y;
            this._lastPosition = position.clone();
            shadowGenerator.getShadowMap().renderList.push(this._box);
            var particleSystem = new BABYLON.ParticleSystem('particles', 200, scene);
            particleSystem.particleTexture = new BABYLON.Texture('assets/lens4.png', scene);
            particleSystem.emitter = this._box;
            particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
            particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
            var particleColor = new BABYLON.Color4(color.r, color.g, color.b, 1.0);
            particleSystem.color1 = particleColor;
            particleSystem.color2 = particleColor.scale(0.5);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
            particleSystem.minSize = 3;
            particleSystem.maxSize = 10;
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1.5;
            particleSystem.emitRate = 100;
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
            particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.minEmitPower = 5;
            particleSystem.maxEmitPower = 15;
            particleSystem.updateSpeed = 0.05;
            particleSystem.start();
            if (attachedSound) {
                attachedSound.attachToMesh(this._box);
                attachedSound.setPosition(new BABYLON.Vector3(10000, 0, 0));
                attachedSound.setAttenuationFunction(function (currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) {
                    var distanceFromZero = BABYLON.Vector3.Zero().subtract(_this._box.getBoundingInfo().boundingSphere.centerWorld).length();
                    if (distanceFromZero < maxDistance) {
                        return currentVolume * (1 - distanceFromZero / maxDistance);
                    }
                    else {
                        return 0;
                    }
                });
                window.setTimeout(function () {
                    attachedSound.setVolume(1);
                }, 1000);
            }
        }
        Object.defineProperty(SoundCube.prototype, "box", {
            get: function () {
                return this._box;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SoundCube.prototype, "position", {
            get: function () {
                return this._box.absolutePosition;
            },
            enumerable: true,
            configurable: true
        });
        SoundCube.prototype.checkCollision = function (checkCollisionWith) {
            var currentboundingbox = this.box.getBoundingInfo().boundingBox;
            var testwithboundingbox, intersects;
            if (this.box.parent !== undefined) {
                var descendants = this.box.parent.getDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    currentboundingbox = descendants[i].getBoundingInfo().boundingBox;
                    for (var j = 0; j < checkCollisionWith.length; j++) {
                        if (SoundCube.isIn(descendants, checkCollisionWith[j]))
                            continue;
                        testwithboundingbox = checkCollisionWith[j].box.getBoundingInfo().boundingBox;
                        intersects = BABYLON.BoundingBox.Intersects(currentboundingbox, testwithboundingbox);
                        if (intersects)
                            return true;
                    }
                }
            }
            else {
                for (var j = 0; j < checkCollisionWith.length; j++) {
                    if (checkCollisionWith[j] === this)
                        continue;
                    testwithboundingbox = checkCollisionWith[j].box.getBoundingInfo().boundingBox;
                    intersects = BABYLON.BoundingBox.Intersects(currentboundingbox, testwithboundingbox);
                    if (intersects)
                        return true;
                }
            }
            return false;
        };
        SoundCube.prototype.getScreenPosition = function () {
            var arr = this._box.getVertexBuffer(BABYLON.VertexBuffer.PositionKind);
            var vertex = BABYLON.Vector3.FromArray(arr.getData(), 0);
            var coords = BABYLON.Vector3.TransformCoordinates(vertex, this._box.getWorldMatrix());
            var res = BABYLON.Vector3.Project(coords, BABYLON.Matrix.Identity(), this._scene.getTransformMatrix(), this._scene.activeCamera.viewport.toGlobal(this._scene.getEngine()));
            res.x /= 2;
            res.y /= 2;
            res.z /= 2;
            return res;
        };
        ;
        SoundCube.prototype.move = function (point, checkCollisionWith) {
            if (this.box.parent === undefined) {
                this.box.position.addInPlace(point);
                this.box.computeWorldMatrix(true);
                if (this.checkCollision(checkCollisionWith)) {
                    this.box.setAbsolutePosition(this._lastPosition.clone());
                }
                else {
                    this._lastPosition = this.box.position.clone();
                }
            }
            else {
                var parent = this.box.parent;
                parent.position.addInPlace(point);
                this.box.computeWorldMatrix(true);
                if (this.checkCollision(checkCollisionWith)) {
                    parent.setAbsolutePosition(this._lastPosition.clone());
                }
                else {
                    this._lastPosition = parent.position.clone();
                }
            }
        };
        SoundCube.prototype.takeoff = function () {
            if (this.box.parent !== undefined) {
                var descendants = this.box.parent.getDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    descendants[i].position.y = this._originHeight + this._flyHeight;
                }
            }
            else {
                this._box.position.y = this._originHeight + this._flyHeight;
            }
        };
        SoundCube.prototype.land = function () {
            if (this.box.parent !== undefined) {
                var descendants = this.box.parent.getDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    descendants[i].position.y = this._originHeight;
                }
            }
            else {
                this._box.position.y = this._originHeight;
            }
        };
        Object.defineProperty(SoundCube.prototype, "parent", {
            set: function (cube) {
                var positioninparentworld;
                var parent;
                if (cube.box.parent === undefined && this.box.parent === undefined) {
                    cube.box.parent = new BABYLON.Mesh('parent', this._scene);
                    parent = cube.box.parent;
                    positioninparentworld = this.box.absolutePosition.subtract(parent.absolutePosition);
                    this.box.parent = cube.box.parent;
                    this.box.position = positioninparentworld;
                    this.magnetize(this, cube);
                }
                else if (cube.box.parent === undefined) {
                    parent = this.box.parent;
                    positioninparentworld = cube.box.absolutePosition.subtract(parent.absolutePosition);
                    cube.box.parent = this.box.parent;
                    cube.box.position = positioninparentworld;
                    this.magnetize(this, cube);
                }
                else if (this.box.parent === undefined) {
                    parent = cube.box.parent;
                    positioninparentworld = this.box.absolutePosition.subtract(parent.absolutePosition);
                    this.box.parent = cube.box.parent;
                    this.box.position = positioninparentworld;
                    this.magnetize(this, cube);
                }
            },
            enumerable: true,
            configurable: true
        });
        SoundCube.prototype.magnetize = function (cube1, cube2) {
            var halfSize = this._boxSize / 2.;
            if (cube1.box.position.x + halfSize < cube2.box.position.x - halfSize) {
                cube1.box.position.z = cube2.box.position.z;
                cube1.box.position.x = cube2.box.position.x - this._boxSize;
            }
            else if (cube1.box.position.z + halfSize < cube2.box.position.z - halfSize) {
                cube1.box.position.z = cube2.box.position.z - this._boxSize;
                cube1.box.position.x = cube2.box.position.x;
            }
            else if (cube1.box.position.x - halfSize > cube2.box.position.x + halfSize) {
                cube1.box.position.z = cube2.box.position.z;
                cube1.box.position.x = cube2.box.position.x + this._boxSize;
            }
            else if (cube1.box.position.z - halfSize > cube2.box.position.z + halfSize) {
                cube1.box.position.z = cube2.box.position.z + this._boxSize;
                cube1.box.position.x = cube2.box.position.x;
            }
        };
        SoundCube.prototype.deMagnetize = function () {
            if (this.box.parent !== undefined) {
                this.box.position = this.box.absolutePosition;
                this.box.parent = undefined;
            }
        };
        SoundCube.prototype.tryMagnetize = function (cubes) {
            for (var i = 0; i < cubes.length; i++) {
                var currentCube = cubes[i];
                if (currentCube !== this) {
                    var distance = Math.abs(BABYLON.Vector3.Distance(this.position, currentCube.position));
                    if (distance < this._magnetizeDistance) {
                        this.parent = currentCube;
                        return true;
                    }
                }
            }
            return false;
        };
        SoundCube.getSoundCubeFromName = function (cubes, name) {
            for (var i = 0; i < cubes.length; i++) {
                if (cubes[i]._name === name) {
                    return cubes[i];
                }
            }
            return null;
        };
        SoundCube.isIn = function (cubes, cube) {
            for (var i = 0; i < cubes.length; i++) {
                if (cubes[i] === cube.box) {
                    return true;
                }
            }
            return false;
        };
        return SoundCube;
    }());
    MusicLounge.SoundCube = SoundCube;
})(MusicLounge || (MusicLounge = {}));
