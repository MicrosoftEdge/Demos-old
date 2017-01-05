module MusicLounge {
    export class SoundCube {
        private _scene: BABYLON.Scene;
        private _box: BABYLON.Mesh;
        private _material: BABYLON.StandardMaterial;
        private _name: string;
        private _flyHeight: number = 3;
        private _originHeight: number;
        private _distanceFromParent: BABYLON.Vector3;
        private _magnetizeDistance: number = 25;
        private _lastPosition: BABYLON.Vector3;
        private _boxSize: number = 20;

        constructor(name: string, position: BABYLON.Vector3, scene: BABYLON.Scene, color: BABYLON.Color3, shadowGenerator: BABYLON.ShadowGenerator, attachedSound?: BABYLON.Sound) {
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

            // Generate internal particules
            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem('particles', 200, scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture('assets/lens4.png', scene);

            // Where the particles come from
            particleSystem.emitter = this._box;
            particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 1); // To...

            // Colors of all particles
            var particleColor = new BABYLON.Color4(color.r, color.g, color.b, 1.0);
            particleSystem.color1 = particleColor;
            particleSystem.color2 = particleColor.scale(0.5);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 3;
            particleSystem.maxSize = 10;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1.5;

            // Emission rate
            particleSystem.emitRate = 100;

            // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            // Set the gravity of all particles
            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

            // Direction of each particle after it has been emitted
            particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);

            // Speed
            particleSystem.minEmitPower = 5;
            particleSystem.maxEmitPower = 15;
            particleSystem.updateSpeed = 0.05;

            // Start the particle system
            particleSystem.start();

            if (attachedSound) {
                attachedSound.attachToMesh(this._box);
                attachedSound.setPosition(new BABYLON.Vector3(10000, 0, 0));
                attachedSound.setAttenuationFunction((currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) => {
                    var distanceFromZero: number = BABYLON.Vector3.Zero().subtract(this._box.getBoundingInfo().boundingSphere.centerWorld).length();
                    if (distanceFromZero < maxDistance) {
                        return currentVolume * (1 - distanceFromZero / maxDistance);
                    }
                    else {
                        return 0;
                    }
                });
                window.setTimeout(() => {
                    attachedSound.setVolume(1);
                }, 1000);
            }
        }

        public get box(): BABYLON.Mesh {
            return this._box;
        }

        public get position(): BABYLON.Vector3 {
            return this._box.absolutePosition;
        }

        public checkCollision(checkCollisionWith?: Array<SoundCube>): boolean {
            var currentboundingbox = this.box.getBoundingInfo().boundingBox;
            var testwithboundingbox, intersects;

            if (this.box.parent !== undefined) {
                var descendants = this.box.parent.getDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    currentboundingbox = (<BABYLON.Mesh>descendants[i]).getBoundingInfo().boundingBox;
                    for (var j = 0; j < checkCollisionWith.length; j++) {
                        if (SoundCube.isIn(descendants, checkCollisionWith[j]))
                            continue;
                        testwithboundingbox = checkCollisionWith[j].box.getBoundingInfo().boundingBox;
                        intersects = BABYLON.BoundingBox.Intersects(currentboundingbox, testwithboundingbox);
                        if (intersects) return true;
                    }
                }
            } else {
                for (var j = 0; j < checkCollisionWith.length; j++) {
                    if (checkCollisionWith[j] === this)
                        continue;
                    testwithboundingbox = checkCollisionWith[j].box.getBoundingInfo().boundingBox;
                    intersects = BABYLON.BoundingBox.Intersects(currentboundingbox, testwithboundingbox);
                    if (intersects) return true;
                }
            }

            return false;
        }

        public getScreenPosition(): BABYLON.Vector3 {
            var arr: BABYLON.VertexBuffer = this._box.getVertexBuffer(BABYLON.VertexBuffer.PositionKind);
            var vertex = BABYLON.Vector3.FromArray(arr.getData(), 0);
            var coords = BABYLON.Vector3.TransformCoordinates(vertex, this._box.getWorldMatrix());

            var res = BABYLON.Vector3.Project(coords, BABYLON.Matrix.Identity(), this._scene.getTransformMatrix(), this._scene.activeCamera.viewport.toGlobal(this._scene.getEngine()));
            res.x /= 2;
            res.y /= 2;
            res.z /= 2;
            return res;
        };

        public move(point: BABYLON.Vector3, checkCollisionWith: Array<SoundCube>): void {
            //if (BABYLON.Vector3.Distance(point, BABYLON.Vector3.Zero()) > 30) {
            //    this.deMagnetize();
            //    this.box.computeWorldMatrix(true);
            //}

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
                var parent = <BABYLON.Mesh>this.box.parent;
                parent.position.addInPlace(point);
                this.box.computeWorldMatrix(true);
                if (this.checkCollision(checkCollisionWith)) {
                    parent.setAbsolutePosition(this._lastPosition.clone());
                }
                else {
                    this._lastPosition = parent.position.clone();
                }
            }
        }

        public takeoff(): void {
            if (this.box.parent !== undefined) {
                var descendants = this.box.parent.getDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    (<BABYLON.Mesh>descendants[i]).position.y = this._originHeight + this._flyHeight;
                }
            } else {
                this._box.position.y = this._originHeight + this._flyHeight;
            }
        }

        public land(): void {
            if (this.box.parent !== undefined) {
                var descendants = this.box.parent.getDescendants();
                for (var i = 0; i < descendants.length; i++) {
                    (<BABYLON.Mesh>descendants[i]).position.y = this._originHeight;
                }
            } else {
                this._box.position.y = this._originHeight;
            }
        }

        public set parent(cube: SoundCube) {
            var positioninparentworld;
            var parent;

            if (cube.box.parent === undefined && this.box.parent === undefined) {
                cube.box.parent = new BABYLON.Mesh('parent', this._scene);
                parent = <BABYLON.Mesh>cube.box.parent;
                positioninparentworld = this.box.absolutePosition.subtract(parent.absolutePosition);
                this.box.parent = cube.box.parent;
                this.box.position = positioninparentworld;
                this.magnetize(this, cube);
            } else if (cube.box.parent === undefined) {
                parent = <BABYLON.Mesh>this.box.parent;
                positioninparentworld = cube.box.absolutePosition.subtract(parent.absolutePosition);
                cube.box.parent = this.box.parent;
                cube.box.position = positioninparentworld;
                this.magnetize(this, cube);
            }
            else if (this.box.parent === undefined) {
                parent = <BABYLON.Mesh>cube.box.parent;
                positioninparentworld = this.box.absolutePosition.subtract(parent.absolutePosition);
                this.box.parent = cube.box.parent;
                this.box.position = positioninparentworld;
                this.magnetize(this, cube);
            }
        }

        public magnetize(cube1: SoundCube, cube2: SoundCube) {
            var halfSize = this._boxSize / 2.
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
        }

        public deMagnetize() {
            if (this.box.parent !== undefined) {
                this.box.position = this.box.absolutePosition;
                this.box.parent = undefined;
            }
        }

        public tryMagnetize(cubes: Array<SoundCube>): boolean {
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
        }

        public static getSoundCubeFromName(cubes: Array<SoundCube>, name: string): SoundCube {
            for (var i = 0; i < cubes.length; i++) {
                if (cubes[i]._name === name) {
                    return cubes[i];
                }
            }
            return null;
        }

        public static isIn(cubes: Array<BABYLON.Node>, cube: SoundCube): boolean {
            for (var i = 0; i < cubes.length; i++) {
                if (<BABYLON.Mesh>cubes[i] === cube.box) {
                    return true;
                }
            }
            return false;
        }
    }
}