module MusicLounge {
    export class SoundsLoader {
        public sounds: BABYLON.Sound[] = [];
        public soundsToLoad = ['cellolong', 'cellolong2', 'rapidviolons', 'trombones', 'violons11', 'violons18', 'voices'];
        public soundsDirectory = 'assets';
        private _soundsLoaded = 0;
        private _callback;

        constructor(scene, callback?: () => any) {
            this._callback = callback;

            var assetsManager = new BABYLON.AssetsManager(scene);

            for (var i = 0; i < this.soundsToLoad.length; i++) {
                assetsManager.addBinaryFileTask('soundTask' + i, this.soundsDirectory + '/' + this.soundsToLoad[i] +'.wav').onSuccess = (task: BABYLON.BinaryFileAssetTask) => {
                    this.sounds.push(new BABYLON.Sound('sound' + this.sounds.length, task.data, scene, () => {
                        this._newSoundLoaded();
                    }, { loop: true, spatialSound: true, useCustomAttenuation: true, volume: 0, maxDistance: 100 }));
                }
            }

            assetsManager.load();
        }

        private _newSoundLoaded() {
            this._soundsLoaded++;
            if (this._soundsLoaded === this.soundsToLoad.length) {
                for (var i = 0; i < this.sounds.length; i++) {
                    this.sounds[i].play();
                }

                if (this._callback) {
                    this._callback();
                }
            }
        }
    }
}