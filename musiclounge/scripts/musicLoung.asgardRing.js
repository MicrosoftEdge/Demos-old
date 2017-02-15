var MusicLounge;
(function (MusicLounge) {
    var AsgardRing = (function () {
        function AsgardRing(scene) {
            var particleSystem = new BABYLON.ParticleSystem('particles', 2000, scene);
            this._particleSystem = particleSystem;
            particleSystem.particleTexture = new BABYLON.Texture('assets/lens4.png', scene);
            particleSystem.emitter = BABYLON.Vector3.Zero();
            particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
            particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
            particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
            particleSystem.minSize = 2;
            particleSystem.maxSize = 10;
            particleSystem.minLifeTime = 0.3;
            particleSystem.maxLifeTime = 1.5;
            particleSystem.emitRate = 500;
            particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
            particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
            particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, 1, 0);
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;
            particleSystem.minEmitPower = 30;
            particleSystem.maxEmitPower = 30;
            particleSystem.updateSpeed = 0.05;
            var alpha = 0;
            particleSystem.startPositionFunction = function (worldMatrix, position) {
                position.x = 80 * Math.cos(alpha);
                position.y = 0;
                position.z = 80 * Math.sin(alpha);
                alpha += 0.01;
            };
            particleSystem.start();
        }
        return AsgardRing;
    }());
    MusicLounge.AsgardRing = AsgardRing;
})(MusicLounge || (MusicLounge = {}));
