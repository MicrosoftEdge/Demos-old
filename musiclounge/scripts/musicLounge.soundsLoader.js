var MusicLounge;
(function (MusicLounge) {
    var SoundsLoader = (function () {
        function SoundsLoader(scene, callback) {
            var _this = this;
            this.sounds = [];
            this.soundsToLoad = ['cellolong', 'cellolong2', 'rapidviolons', 'trombones', 'violons11', 'violons18', 'voices'];
            this.soundsDirectory = 'assets';
            this._soundsLoaded = 0;
            this._callback = callback;
            var assetsManager = new BABYLON.AssetsManager(scene);
            for (var i = 0; i < this.soundsToLoad.length; i++) {
                assetsManager.addBinaryFileTask('soundTask' + i, this.soundsDirectory + '/' + this.soundsToLoad[i] + '.wav').onSuccess = function (task) {
                    _this.sounds.push(new BABYLON.Sound('sound' + _this.sounds.length, task.data, scene, function () {
                        _this._newSoundLoaded();
                    }, { loop: true, spatialSound: true, useCustomAttenuation: true, volume: 0, maxDistance: 100 }));
                };
            }
            assetsManager.load();
        }
        SoundsLoader.prototype._newSoundLoaded = function () {
            this._soundsLoaded++;
            if (this._soundsLoaded === this.soundsToLoad.length) {
                for (var i = 0; i < this.sounds.length; i++) {
                    this.sounds[i].play();
                }
                if (this._callback) {
                    this._callback();
                }
            }
        };
        return SoundsLoader;
    }());
    MusicLounge.SoundsLoader = SoundsLoader;
})(MusicLounge || (MusicLounge = {}));
