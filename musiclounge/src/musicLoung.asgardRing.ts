module MusicLounge {
    export class AsgardRing {
        private _scene: BABYLON.Scene;
        private _particleSystem: BABYLON.ParticleSystem;

        constructor(scene: BABYLON.Scene) {
            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene);
            this._particleSystem = particleSystem;

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture('assets/lens4.png', scene);

            // Where the particles come from
            particleSystem.emitter = BABYLON.Vector3.Zero();
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

            // Colors of all particles
            particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 2;
            particleSystem.maxSize = 10;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1.5;

            // Emission rate
            particleSystem.emitRate = 500;

            // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

            // Set the gravity of all particles
            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

            // Direction of each particle after it has been emitted
            particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);

            // Angular speed, in radians
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;

            // Speed
            particleSystem.minEmitPower = 30;
            particleSystem.maxEmitPower = 30;
            particleSystem.updateSpeed = 0.05;
          
            var alpha = 0;
            particleSystem.startPositionFunction = (worldMatrix, position) => {
                position.x = 80 * Math.cos(alpha);
                position.y = 0;
                position.z = 80 * Math.sin(alpha);

                alpha += 0.01;
            }

            // Start the particle system
            particleSystem.start();
        }
    }
}