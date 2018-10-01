/* global $, ui */
(function() {
	'use strict';

	var audio = {
		timerWorkerUrl: 'scripts/timerworker.js',
		timerWorker: null,

		notes: 16,

		notePosition: 0,
		noteTime: 0,
		startTime: 0,
		lastUIUpdateTime: -1,
		masterGain: null,
		playing: false,
		soundTracks: null,

		savedSet: null,
		currentlyOpenedId: -1,
		unsavedChanges: false,

		context: null,

		defaultSettings: {
			notePosition: 0,
			noteTime: 0.0,
			lastUIUpdateTime: -1,
			playing: false,
			unsavedChanges: false,

			savedSet: {
				metadata: {
					name: '',
					author: '',
					genre: ''
				},
				settings: {
					volume: 50,
					tempo: 60, // expressed in beats per minute (BPM)
					tracks: [
						{name: 'kick', file: 'kick.wav', volume: 50, active: true, notes: []},
						{name: 'tom', file: 'tom.wav', volume: 50, active: true, notes: []},
						{name: 'snare', file: 'snare.wav', volume: 50, active: true, notes: []},
						{name: 'hihat', file: 'hihat.wav', volume: 50, active: true, notes: []},
						{name: 'crash', file: 'crash.wav', volume: 50, active: true, notes: []},
						{name: 'ride', file: 'ride.wav', volume: 50, active: true, notes: []},
						{name: 'bass', file: 'bass.wav', volume: 50, active: true, notes: []}
					]
				}
			}
		},

		reset: function(set) {
			this.notePosition = this.defaultSettings.notePosition;
			this.noteTime = this.defaultSettings.noteTime;
			this.lastUIUpdateTime = this.defaultSettings.lastUIUpdateTime;
			this.playing = this.defaultSettings.playing;
			this.unsavedChanges = this.defaultSettings.unsavedChanges;

			// use the provided set or use a copy of the default settings
			this.savedSet = set || $.extend(true, {}, this.defaultSettings.savedSet);

			// if no default set was defined, set all notes to false
			if (!set) {
				var tracks = this.savedSet.settings.tracks;

				for (var i = 0; i < tracks.length; i++) {
					for (var j = 0; j < this.notes; j++) {
						tracks[i].notes[j] = false;
					}
				}
			}
		},

		init: function() {
			this.initContext();

			this.reset();

			ui.drawTracks();
			ui.updateTracks(this.savedSet);

			if (!this.context) {
				return;
			}

			var SoundTracks = this.bufferLoaderInit();
			this.soundTracks = new SoundTracks();

			var finalNode = this.context.destination;

			// create master gain node
			this.masterGain = this.context.createGain();
			this.masterGain.gain.value = this.savedSet.settings.volume / 100;
			this.masterGain.connect(finalNode);

			this.timerWorker = new Worker(this.timerWorkerUrl);

			this.timerWorker.onmessage = function(e) {
				if (e.data === 'schedule') {
					audio.schedule();
				}
			};
		},

		initContext: function() {
			if (window.AudioContext || window.webkitAudioContext) {
				this.context = new (window.AudioContext || window.webkitAudioContext)();

				if (!this.context.createGain) {
					this.context.createGain = this.context.createGainNode;
				}

				if (!this.context.createDelay) {
					this.context.createDelay = this.context.createDelayNode;
				}

				if (!this.context.createScriptProcessor) {
					this.context.createScriptProcessor = this.context.createJavaScriptNode;
				}
			}
		},

		open: function(set, id) {
			this.pause();
			var currentIndex = (this.notePosition + this.notes) % this.notes;

			ui.setUnsavedChanges(false);
			ui.clearPlayhead(currentIndex);
			ui.clearActiveRow();

			// open existing set, otherwise open new
			if (set) {
				this.currentlyOpenedId = id;
				this.reset(set);
			} else {
				this.currentlyOpenedId = -1;
				this.reset();
			}

			ui.updateTracks(audio.savedSet);
		},

		toggle: function() {
			if (this.context.state === 'suspended') {
				this.context.resume();
			}
			if (this.playing) {
				this.pause();
			} else {
				this.play();
			}
		},

		play: function() {
			if (this.playing) {
				return;
			}

			ui.playPause(true);

			this.noteTime = 0.0;
			this.startTime = this.context.currentTime + 0.005;
			this.schedule();
			this.timerWorker.postMessage('start');

			this.playing = true;
		},

		pause: function() {
			if (!this.playing) {
				return;
			}

			ui.playPause(false);

			this.timerWorker.postMessage('pause');

			// go back one note so that we can resume at the current position next play
			this.notePosition = (this.notePosition + this.notes - 1) % this.notes;

			this.playing = false;
		},

		/*************************************
		 *************************************
		 ***** Handle playback of tracks *****
		 *************************************
		 *************************************/
		schedule: function() {
			// start at startTime; normalize currentTime to 0 at the start
			var currentTime = this.context.currentTime - this.startTime;
			var tracks = this.savedSet.settings.tracks;

			while (this.noteTime < currentTime + 0.1) {
				// Convert noteTime to context time.
				var contextPlayTime = this.noteTime + this.startTime;

				for (var i = 0; i < tracks.length; i++) {
					if (tracks[i].active && tracks[i].notes[this.notePosition]) {
						this.playNote(tracks[i], contextPlayTime);
					}
				}

				// Synchronize playhead with sound playback
				if (this.noteTime !== this.lastUIUpdateTime) {
					this.lastUIUpdateTime = this.noteTime;

					var currentIndex = (this.notePosition + this.notes) % this.notes;
					var previousIndex = (currentIndex + this.notes - 1) % this.notes;
					ui.movePlayheadForward(currentIndex, previousIndex);
				}

				this.moveNoteForward();
			}
		},

		playNote: function(track, noteTime) {
			// Create the source note
			var source = this.context.createBufferSource();
			source.buffer = this.soundTracks[track.name];

			// Create gain and connect source to it
			var gainNode = this.context.createGain();
			var fraction = track.volume / 100;
			gainNode.gain.value = fraction;
			source.connect(gainNode);

			// Connect gain to master gain
			gainNode.connect(this.masterGain);

			// Start playing source
			source.start(noteTime);
		},

		moveNoteForward: function() {
			/**
			 * Proceed time by an 8th note. To determine duration of a note:
			 * Half note         =  120 / BPM
			 * Quarter note      =   60 / BPM
			 * Eighth note       =   30 / BPM
			 * Sixteenth note    =   15 / BPM
			 */
			var secondsPerBeat = (240 / this.notes) / this.savedSet.settings.tempo;

			this.notePosition++;
			if (this.notePosition === this.notes) {
				this.notePosition = 0;
			}

			this.noteTime += secondsPerBeat;
		},

		/**************************************
		 **************************************
		 ***** Load sounds from wav files *****
		 **************************************
		 **************************************/
		bufferLoaderInit: function() {
			var BufferLoader = function(ctxt, urlList, callback) {
				this.context = ctxt;
				this.urlList = urlList;
				this.onload = callback;
				this.bufferList = [];
				this.loadCount = 0;
			};

			BufferLoader.prototype.loadBuffer = function(url, index) {
				// Load buffer asynchronously
				var request = new XMLHttpRequest();
				request.open('GET', url, true);
				request.responseType = 'arraybuffer';

				var loader = this;

				request.onload = function() {
					// Asynchronously decode the audio file data in request.response
					loader.context.decodeAudioData(
						request.response,
						function(buffer) {
							if (!buffer) {
								ui.alert('Error decoding file data: ' + url);
								return;
							}

							loader.bufferList[index] = buffer;

							if (++loader.loadCount === loader.urlList.length) {
								loader.onload(loader.bufferList);
							}
						},
						function(error) {
							ui.alert('decodeAudioData error: ' + error);
						}
					);
				};

				request.onerror = function() {
					ui.alert('BufferLoader: XHR error');
				};

				request.send();
			};

			BufferLoader.prototype.load = function() {
				for (var i = 0; i < this.urlList.length; ++i) {
					this.loadBuffer(this.urlList[i], i);
				}
			};

			var loadSounds = function(obj, sounds, callback) {
				// Array-ify
				var names = [];
				var paths = [];

				for (var i = 0; i < sounds.length; i++) {
					var path = 'sounds/' + sounds[i].file;
					names.push(sounds[i].name);
					paths.push(path);
				}

				var bufferLoader = new BufferLoader(audio.context, paths, function(bufferList) {
					for (i = 0; i < bufferList.length; i++) {
						var buffer = bufferList[i];
						var name = names[i];
						obj[name] = buffer;
					}

					if (callback) {
						callback();
					}
				});

				bufferLoader.load();
			};

			return function() {
				loadSounds(this, audio.savedSet.settings.tracks);
			};
		}
	};

	window.audio = audio;
}());
