var MusicLounge;
(function (MusicLounge) {
    var Main = (function () {
        function Main() {
            var _this = this;
            this._soundCubes = new Array();
            this._canvas = document.getElementById('renderCanvas');
            this._engine = new BABYLON.Engine(this._canvas, true);
            this._scene = new BABYLON.Scene(this._engine);
            this._soundsLoader = new MusicLounge.SoundsLoader(this._scene, function () {
                _this._launchMusicLounge();
            });
        }
        Main.prototype._launchMusicLounge = function () {
            var _this = this;
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
            this._globalParticleSystem = new MusicLounge.GlobalEqualizer(this._scene);
            // Asgard
            this._ring = new MusicLounge.AsgardRing(this._scene);
            // Ground
            var ground = BABYLON.Mesh.CreateGround('ground', 10000, 10000, 1, this._scene, false);
            var groundMaterial = new BABYLON.StandardMaterial('ground', this._scene);
            groundMaterial.specularColor = BABYLON.Color3.Black();
            ground.material = groundMaterial;
            ground.receiveShadows = true;
            // Meshes
            this._soundCubes.push(new MusicLounge.SoundCube('red', new BABYLON.Vector3(-100, 10, 0), this._scene, BABYLON.Color3.Red(), shadowGenerator, this._soundsLoader.sounds[0]));
            this._soundCubes.push(new MusicLounge.SoundCube('green', new BABYLON.Vector3(0, 10, -100), this._scene, BABYLON.Color3.Green(), shadowGenerator, this._soundsLoader.sounds[1]));
            this._soundCubes.push(new MusicLounge.SoundCube('blue', new BABYLON.Vector3(100, 10, 0), this._scene, BABYLON.Color3.Blue(), shadowGenerator, this._soundsLoader.sounds[2]));
            this._soundCubes.push(new MusicLounge.SoundCube('purple', new BABYLON.Vector3(0, 10, 100), this._scene, BABYLON.Color3.Purple(), shadowGenerator, this._soundsLoader.sounds[3]));
            this._soundCubes.push(new MusicLounge.SoundCube('yellow', new BABYLON.Vector3(100, 10, 100), this._scene, BABYLON.Color3.Yellow(), shadowGenerator, this._soundsLoader.sounds[4]));
            this._soundCubes.push(new MusicLounge.SoundCube('white', new BABYLON.Vector3(-100, 10, -100), this._scene, BABYLON.Color3.White(), shadowGenerator, this._soundsLoader.sounds[5]));
            // Events
            var canvas = this._engine.getRenderingCanvas();
            var startingPoint = {};
            var currentSoundCube = {};
            //Collisions
            this._scene.collisionsEnabled = true;
            //Movement managemnet
            var getGroundPosition = function () {
                // Use a predicate to get position on the ground
                var pickinfo = _this._scene.pick(_this._scene.pointerX, _this._scene.pointerY, function (mesh) { return (mesh === ground); });
                if (pickinfo.hit) {
                    return pickinfo.pickedPoint;
                }
                return null;
            };
            var onPointerDown = function (evt) {
                if (evt.button !== 0) {
                    return;
                }
                // check if we are under a mesh
                var pickInfo = _this._scene.pick(_this._scene.pointerX, _this._scene.pointerY, function (mesh) { return (mesh !== ground); });
                if (pickInfo.hit) {
                    var selectedMesh = pickInfo.pickedMesh;
                    currentSoundCube[evt.pointerId] = MusicLounge.SoundCube.getSoundCubeFromName(_this._soundCubes, selectedMesh.name);
                    currentSoundCube[evt.pointerId].takeoff();
                    startingPoint[evt.pointerId] = getGroundPosition();
                    if (startingPoint[evt.pointerId]) {
                        setTimeout(function () {
                            _this._camera.detachControl(canvas);
                        }, 0);
                    }
                }
            };
            var onPointerUp = function (evt) {
                if (startingPoint[evt.pointerId]) {
                    _this._camera.attachControl(canvas, true);
                    startingPoint[evt.pointerId] = null;
                    //currentSoundCube[evt.pointerId].tryMagnetize(this._soundCubes);
                    currentSoundCube[evt.pointerId].land();
                    return;
                }
            };
            var onPointerMove = function (evt) {
                if (_this._timeoutId) {
                    clearTimeout(_this._timeoutId);
                    _this._launchTimeout();
                }
                _this._scene.beforeRender = null;
                if (!startingPoint[evt.pointerId]) {
                    return;
                }
                var current = getGroundPosition();
                if (!current) {
                    return;
                }
                var diff = current.subtract(startingPoint[evt.pointerId]);
                currentSoundCube[evt.pointerId].move(diff, _this._soundCubes);
                startingPoint[evt.pointerId] = current;
            };
            canvas.addEventListener('pointerdown', onPointerDown, false);
            canvas.addEventListener('pointerup', onPointerUp, false);
            canvas.addEventListener('pointermove', onPointerMove, false);
            this._scene.onDispose = function () {
                canvas.removeEventListener('pointerdown', onPointerDown);
                canvas.removeEventListener('pointerup', onPointerUp);
                canvas.removeEventListener('pointermove', onPointerMove);
            };
            //Rendering loop
            this._engine.runRenderLoop(function () {
                _this._scene.render();
            });
            window.addEventListener('resize', function () {
                _this._engine.resize();
            });
        };
        Main.prototype._launchTimeout = function () {
            var _this = this;
            this._timeoutId = setTimeout(function () {
                _this._scene.beforeRender = function () {
                    _this._camera.alpha += 0.001 * _this._scene.getAnimationRatio();
                };
            }, 5000);
        };
        return Main;
    })();
    MusicLounge.Main = Main;
})(MusicLounge || (MusicLounge = {}));
//# sourceMappingURL=musicLounge.main.js.map