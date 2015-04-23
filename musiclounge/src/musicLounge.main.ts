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
            this._soundCubes.push(new SoundCube('green', new BABYLON.Vector3(0, 10, -100), this._scene, BABYLON.Color3.Green(), shadowGenerator, this._soundsLoader.sounds[1]));
            this._soundCubes.push(new SoundCube('blue', new BABYLON.Vector3(100, 10, 0), this._scene, BABYLON.Color3.Blue(), shadowGenerator, this._soundsLoader.sounds[2]));
            this._soundCubes.push(new SoundCube('purple', new BABYLON.Vector3(0, 10, 100), this._scene, BABYLON.Color3.Purple(), shadowGenerator, this._soundsLoader.sounds[3]));
            this._soundCubes.push(new SoundCube('yellow', new BABYLON.Vector3(100, 10, 100), this._scene, BABYLON.Color3.Yellow(), shadowGenerator, this._soundsLoader.sounds[4]));
            this._soundCubes.push(new SoundCube('white', new BABYLON.Vector3(-100, 10, -100), this._scene, BABYLON.Color3.White(), shadowGenerator, this._soundsLoader.sounds[5]));

            // Events
            var canvas = this._engine.getRenderingCanvas();
            var startingPoint = {};
            var currentSoundCube = {};

            //Collisions
            this._scene.collisionsEnabled = true;

            //Movement managemnet
            var getGroundPosition = () => {
                // Use a predicate to get position on the ground
                var pickinfo = this._scene.pick(this._scene.pointerX, this._scene.pointerY, mesh => (mesh === ground));
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

            canvas.addEventListener('pointerdown', onPointerDown, false);
            canvas.addEventListener('pointerup', onPointerUp, false);
            canvas.addEventListener('pointermove', onPointerMove, false);

            this._scene.onDispose = () => {
                canvas.removeEventListener('pointerdown', onPointerDown);
                canvas.removeEventListener('pointerup', onPointerUp);
                canvas.removeEventListener('pointermove', onPointerMove);
            }

            //Rendering loop
            this._engine.runRenderLoop(() => {
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