/// <reference path="./babylon.2.1.d.ts" />
/// <reference path="./musicLounge.soundCube.ts" />
/// <reference path="./musicLounge.soundsLoader.ts" />
/// <reference path="./musicLoung.asgardRing.ts" />
/// <reference path="./musicLounge.globalEqualizer.ts" />

module MusicLounge {
    export class Main {
        private _canvas;
        private _engine;
        private _scene;
        private _camera;
        private _soundCubes = new Array<SoundCube>();
        private _globalParticleSystem: GlobalEqualizer;
        private _timeoutId: number;
        private _ring: AsgardRing;
        private _soundsLoader: SoundsLoader;
        private _cubeSelected: number = -1;
        private _keysPressed = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        constructor() {
            this._canvas = document.getElementById('renderCanvas');
            this._engine = new BABYLON.Engine(this._canvas, true);
            this._scene = new BABYLON.Scene(this._engine);

            this._soundsLoader = new SoundsLoader(this._scene, () => {
                this._launchMusicLounge();
            });
        }

        private _launchMusicLounge() {
            this._scene.fogEnabled = true;
            this._scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            this._scene.fogStart = 500;
            this._scene.fogEnd = 1000;

            this._camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 10, new BABYLON.Vector3(0, 0, 0), this._scene);
            this._camera.setPosition(new BABYLON.Vector3(20, 200, 400));
            this._camera.attachControl(this._canvas, false);
            this._camera.minZ = 1;
            this._camera.maxZ = 1500;

            this._camera.lowerBetaLimit = 0.1;
            this._camera.upperBetaLimit = (Math.PI / 2) * 0.99;
            this._camera.lowerRadiusLimit = 150;
            this._camera.upperRadiusLimit = 1000;

            this._scene.clearColor = new BABYLON.Color3(0, 0, 0);
            this._scene.fogColor = new BABYLON.Color3(0, 0, 0);

            // Auto-rotate
            this._launchTimeout();

            // Light
            var light = new BABYLON.SpotLight('spot', new BABYLON.Vector3(0, 50, 0), new BABYLON.Vector3(0, -1, 0.01), 3.2, 1.2, this._scene);

            // Shadows 
            var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
            shadowGenerator.useBlurVarianceShadowMap = true;
            shadowGenerator.bias = 0;

            // Particles
            this._globalParticleSystem = new GlobalEqualizer(this._scene);

            // Asgard
            this._ring = new AsgardRing(this._scene);

            // Ground
            var ground = BABYLON.Mesh.CreateGround('ground', 10000, 10000, 1, this._scene, false);
            var groundMaterial = new BABYLON.StandardMaterial('ground', this._scene);
            groundMaterial.specularColor = BABYLON.Color3.Black();
            ground.material = groundMaterial;
            ground.receiveShadows = true;

            // Meshes
            this._soundCubes.push(new SoundCube('red', new BABYLON.Vector3(-100, 10, 0), this._scene, BABYLON.Color3.Red(), shadowGenerator, this._soundsLoader.sounds[0]));
            this._soundCubes.push(new SoundCube('purple', new BABYLON.Vector3(0, 10, 100), this._scene, BABYLON.Color3.Purple(), shadowGenerator, this._soundsLoader.sounds[3]));
            this._soundCubes.push(new SoundCube('yellow', new BABYLON.Vector3(100, 10, 100), this._scene, BABYLON.Color3.Yellow(), shadowGenerator, this._soundsLoader.sounds[4]));
            this._soundCubes.push(new SoundCube('blue', new BABYLON.Vector3(100, 10, 0), this._scene, BABYLON.Color3.Blue(), shadowGenerator, this._soundsLoader.sounds[2]));
            this._soundCubes.push(new SoundCube('green', new BABYLON.Vector3(0, 10, -100), this._scene, BABYLON.Color3.Green(), shadowGenerator, this._soundsLoader.sounds[1]));
            this._soundCubes.push(new SoundCube('white', new BABYLON.Vector3(-100, 10, -100), this._scene, BABYLON.Color3.White(), shadowGenerator, this._soundsLoader.sounds[5]));

            // Events
            var canvas = this._engine.getRenderingCanvas();
            var startingPoint = {};
            var currentSoundCube = {};

            //Collisions
            this._scene.collisionsEnabled = true;

            //Movement managemnet
            var getGroundPosition = (x = this._scene.pointerX, y = this._scene.pointerY) => {
                // Use a predicate to get position on the ground
                var pickinfo = this._scene.pick(x, y, mesh => (mesh === ground));
                if (pickinfo.hit) {
                    return pickinfo.pickedPoint;
                }

                return null;
            }

            var onPointerDown = (evt) => {
                if (evt.button !== 0) {
                    return;
                }

                // check if we are under a mesh
                var pickInfo = this._scene.pick(this._scene.pointerX, this._scene.pointerY, mesh => (mesh !== ground));
                if (pickInfo.hit) {
                    var selectedMesh = pickInfo.pickedMesh;
                    currentSoundCube[evt.pointerId] = SoundCube.getSoundCubeFromName(this._soundCubes, selectedMesh.name);
                    currentSoundCube[evt.pointerId].takeoff();
                    startingPoint[evt.pointerId] = getGroundPosition();

                    if (startingPoint[evt.pointerId]) { // we need to disconnect camera from canvas
                        setTimeout(() => {
                            this._camera.detachControl(canvas);
                        }, 0);
                    }
                }
            }

            var onPointerUp = (evt) => {
                if (startingPoint[evt.pointerId]) {
                    this._camera.attachControl(canvas, true);
                    startingPoint[evt.pointerId] = null;
                    //currentSoundCube[evt.pointerId].tryMagnetize(this._soundCubes);
                    currentSoundCube[evt.pointerId].land();
                    return;
                }
            }

            var onPointerMove = (evt) => {
                if (this._timeoutId) {
                    clearTimeout(this._timeoutId);
                    this._launchTimeout();
                }

                this._scene.beforeRender = null;

                if (!startingPoint[evt.pointerId]) {
                    return;
                }

                var current = getGroundPosition();

                if (!current) {
                    return;
                }

                var diff = current.subtract(startingPoint[evt.pointerId]);
                currentSoundCube[evt.pointerId].move(diff, this._soundCubes);

                startingPoint[evt.pointerId] = current;
            }

            var tab = (evt) => {
                var currentSelected: SoundCube = this._soundCubes[this._cubeSelected];

                if ((this._cubeSelected !== this._soundCubes.length - 1 || evt.shiftKey) && (this._cubeSelected !== 0 || !evt.shiftKey)) {
                    evt.preventDefault();
                }

                if (currentSelected) {
                    currentSelected.land();
                }

                if (evt.shiftKey) {
                    if (!currentSelected) {
                        this._cubeSelected = this._soundCubes.length - 1;
                    } else {
                        this._cubeSelected--;
                    }
                } else {
                    this._cubeSelected++;
                }

                if (this._cubeSelected >= this._soundCubes.length || this._cubeSelected < 0) {
                    this._cubeSelected = -1;
                    return;
                }

                this._soundCubes[this._cubeSelected].takeoff();
                return;
            }

            var onKeyDown = (evt) => {
                var charCode = (typeof evt.which === "number") ? evt.which : evt.keyCode;

                switch (charCode) {
                    case 9: //tab key
                        tab(evt);
                        break;
                    case 65: //left (key A)
                        this._keysPressed.left = true;
                        break;
                    case 87: //up (key W)
                        this._keysPressed.up = true;
                        break;
                    case 68: //right (key D)
                        this._keysPressed.right = true;
                        break;
                    case 83: //down (key S)
                        this._keysPressed.down = true;
                        break;
                }
            }

            var onKeyUp = (evt) => {
                var charCode = (typeof evt.which === "number") ? evt.which : evt.keyCode;

                switch (charCode) {
                    case 65: //left (key A)
                        this._keysPressed.left = false;
                        break;
                    case 87: //up (key W)
                        this._keysPressed.up = false;
                        break;
                    case 68: //right (key D)
                        this._keysPressed.right = false;
                        break;
                    case 83: //down (key S)
                        this._keysPressed.down = false;
                        break;
                }
            }

            var onBlur = (evt) => {
                for (var i = 0, li = this._soundCubes.length; i < li; i++) {
                    this._soundCubes[i].land();
                }

                this._cubeSelected = -1;
            }

            canvas.addEventListener('pointerdown', onPointerDown, false);
            canvas.addEventListener('pointerup', onPointerUp, false);
            canvas.addEventListener('pointermove', onPointerMove, false);
            canvas.addEventListener('keydown', onKeyDown, false);
            canvas.addEventListener('keyup', onKeyUp, false);
            canvas.addEventListener('blur', onBlur, false);

            this._scene.onDispose = () => {
                canvas.removeEventListener('pointerdown', onPointerDown);
                canvas.removeEventListener('pointerup', onPointerUp);
                canvas.removeEventListener('pointermove', onPointerMove);
                canvas.removeEventListener('keydown', onKeyDown, false);
                canvas.removeEventListener('keyup', onKeyUp, false);
                canvas.removeEventListener('blur', onBlur, false);
            }

            var moveCube = () => {
                var selectedCube: SoundCube = this._soundCubes[this._cubeSelected];
                var point: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);

                if (!selectedCube) {
                    return;
                }

                if (this._keysPressed.up) {
                    point.y++;
                }

                if (this._keysPressed.down) {
                    point.y--;
                }

                if (this._keysPressed.left) {
                    point.x++;
                }

                if (this._keysPressed.right) {
                    point.x--;
                }

                if (point.x !== 0 || point.y !== 0) {
                    if (this._timeoutId) {
                        clearTimeout(this._timeoutId);
                        this._launchTimeout();
                    }

                    this._scene.beforeRender = null;
                } else {
                    return;
                }

                var screenPosition = selectedCube.getScreenPosition();

                var origPosition = getGroundPosition(screenPosition.x, screenPosition.y);
                var destPosition = getGroundPosition(screenPosition.x + point.x, screenPosition.y + point.y);

                if (!origPosition || !destPosition) {
                    return;
                }

                var diff = origPosition.subtract(destPosition);

                selectedCube.move(diff, this._soundCubes);
            };

            //Rendering loop
            this._engine.runRenderLoop(() => {
                moveCube();
                this._scene.render();
            });

            window.addEventListener('resize', () => {
                this._engine.resize();
            });
        }

        private _launchTimeout(): void {
            this._timeoutId = setTimeout(() => {
                this._scene.beforeRender = () => {
                    this._camera.alpha += 0.001 * this._scene.getAnimationRatio();
                }
            }, 5000);
        }
    }
}