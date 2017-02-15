var MusicLounge;
(function (MusicLounge) {
    var GlobalEqualizer = (function () {
        function GlobalEqualizer(scene) {
            this._scene = scene;
            var myAnalyser = new BABYLON.Analyser(scene);
            BABYLON.Engine.audioEngine.connectToAnalyser(myAnalyser);
            myAnalyser.FFT_SIZE = 32;
            myAnalyser.SMOOTHING = 0.1;
            var spatialBoxArray = [];
            var angle = 0;
            var material = new BABYLON.StandardMaterial('sbm', scene);
            material.emissiveColor = new BABYLON.Color3(0.5, 0.25, 0);
            for (var index = 0; index < myAnalyser.FFT_SIZE / 2; index++) {
                var spatialBox = BABYLON.Mesh.CreateBox('sb' + index, 1, scene);
                spatialBox.isVisible = false;
                spatialBox.position = new BABYLON.Vector3(300 * Math.cos(angle), -5, 300 * Math.sin(angle));
                spatialBoxArray.push(spatialBox);
                this._attachParticles(spatialBox);
                angle += Math.PI / (myAnalyser.FFT_SIZE / 4);
            }
            var previousArray;
            scene.registerBeforeRender(function () {
                var workingArray = myAnalyser.getByteFrequencyData();
                if (!previousArray) {
                    previousArray = new Uint8Array(workingArray);
                    return;
                }
                for (var i = 0; i < myAnalyser.getFrequencyBinCount(); i++) {
                    var percent = workingArray[i] - previousArray[i];
                    spatialBoxArray[i].position.y += percent * 2;
                    spatialBoxArray[i].position.y = Math.max(-5, Math.min(150, spatialBoxArray[i].position.y));
                }
                previousArray = new Uint8Array(workingArray);
            });
        }
        GlobalEqualizer.prototype._attachParticles = function (emitter) {
            var particleSystem = new BABYLON.ParticleSystem('particles', 200, this._scene);
            particleSystem.particleTexture = new BABYLON.Texture('assets/lens5.png', this._scene);
            particleSystem.emitter = emitter;
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
            particleSystem.color1 = new BABYLON.Color4(1.0, 0.5, 0.0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.5, 0.25, 0.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
            particleSystem.minSize = 10;
            particleSystem.maxSize = 10;
            particleSystem.minLifeTime = 1.0;
            particleSystem.maxLifeTime = 3.0;
            particleSystem.emitRate = 100;
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            particleSystem.gravity = new BABYLON.Vector3(0, -10, 0);
            particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;
            particleSystem.minEmitPower = 1;
            particleSystem.maxEmitPower = 3;
            particleSystem.updateSpeed = 0.05;
            particleSystem.start();
        };
        return GlobalEqualizer;
    }());
    MusicLounge.GlobalEqualizer = GlobalEqualizer;
})(MusicLounge || (MusicLounge = {}));
