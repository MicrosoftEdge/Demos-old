module MusicLounge {
    export class GlobalEqualizer {
        private _scene: BABYLON.Scene;

        constructor(scene: BABYLON.Scene) {
            this._scene = scene;         
            // Analyzer
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

            scene.registerBeforeRender(() => {
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

        private _attachParticles(emitter: BABYLON.Mesh): void {
            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem('particles', 200, this._scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture('assets/lens5.png', this._scene);

            // Where the particles come from
            particleSystem.emitter = emitter;
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

            // Colors of all particles
            particleSystem.color1 = new BABYLON.Color4(1.0, 0.5, 0.0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.5, 0.25, 0.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 10;
            particleSystem.maxSize = 10;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 1.0;
            particleSystem.maxLifeTime = 3.0;

            // Emission rate
            particleSystem.emitRate = 100;

            // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            // Set the gravity of all particles
            particleSystem.gravity = new BABYLON.Vector3(0, -10, 0);

            // Direction of each particle after it has been emitted
            particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);

            // Angular speed, in radians
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;

            // Speed
            particleSystem.minEmitPower = 1;
            particleSystem.maxEmitPower = 3;
            particleSystem.updateSpeed = 0.05;

            // Start the particle system
            particleSystem.start();
        }
    }
}