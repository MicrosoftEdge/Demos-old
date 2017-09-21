(function () {
	'use strict';

	var musicBlobArray = [];
	var notes = [
		{name: 'C', y: 0, size: 9194, blob: null, src: '#C_note'},
		{name: 'C_sharp', y: 0, size: 9194, blob: null, src: '#C_sharp_note'},
		{name: 'D', y: 2.5, size: 8358, blob: null, src: '#B_note'},
		{name: 'D_sharp', y: 2, size: 8358, blob: null, src: '#A_sharp_note'},
		{name: 'E', y: 2, size: 8776, blob: null, src: '#B_note'},
		{name: 'F', y: 1.5, size: 7940, blob: null, src: '#B_note'},
		{name: 'F_sharp', y: 1, size: 8358, blob: null, src: '#A_sharp_note'},
		{name: 'G', y: 1, size: 8358, blob: null, src: '#B_note'},
		{name: 'G_sharp', y: 0.5, size: 7940, blob: null, src: '#A_sharp_note'},
		{name: 'A', y: 0.5, size: 7522, blob: null, src: '#B_note'},
		{name: 'A_sharp', y: 0, size: 7940, blob: null, src: '#A_sharp_note'},
		{name: 'B', y: 0, size: 8358, blob: null, src: '#B_note'},
		{name: 'C2', y: -0.5, size: 7940, blob: null, src: '#B_note'},
		{name: 'C2_sharp', y: -1, size: 7940, blob: null, src: '#A_sharp_note'},
		{name: 'D2', y: -1, size: 7940, blob: null, src: '#B_note'},
		{name: 'D2_sharp', y: -1.5, size: 8358, blob: null, src: '#A_sharp_note'},
		{name: 'E2', y: -1.5, size: 8358, blob: null, src: '#B_note'},
		{name: 'F2', y: -2, size: 7940, blob: null, src: '#B_note'},
		{name: 'F2_sharp', y: -2.5, size: 7940, blob: null, src: '#A_sharp_note'},
		{name: 'G2', y: -2.5, size: 7940, blob: null, src: '#B_note'},
		{name: 'G2_sharp', y: -3, size: 6686, blob: null, src: '#A_sharp_note'},
		{name: 'A2', y: -3, size: 6268, blob: null, src: '#B_note'},
		{name: 'A2_sharp', y: -3.5, size: 6268, blob: null, src: '#A_sharp_note'},
		{name: 'B2', y: -3.5, size: 7104, blob: null, src: '#B_note'}
	];
	var position = 0;
	var yOffset = 0;
	var blobConstSupport = false;
	var dirty = true;

	var getMusicBlob = function () {
		var blob;
		if (blobConstSupport) {
			blob = new Blob(musicBlobArray, {
				type: 'audio/mpeg'
			});
		} else {
			var bb = new window.BlobBuilder();
			for (var i = 0; i < musicBlobArray.length; i++) {
				bb.append(musicBlobArray[i]);
			}
			blob = bb.getBlob('audio/mpeg');
		}
		return blob;
	};

	var getScoreBlob = function () {
		var blob;
		var score = document.getElementById('score-container').innerHTML;

		if (blobConstSupport) {
			blob = new Blob([score], {
				type: 'image/svg+xml'
			});
		} else {
			var bb = new window.BlobBuilder();
			bb.append(score);
			blob = bb.getBlob('image/svg+xml');
		}

		return blob;
	};

	var updateFileSizes = function () {
		if (blobConstSupport || window.BlobBuilder) {
			document.getElementById('music-blob-size').innerHTML = getMusicBlob().size;
			document.getElementById('score-blob-size').innerHTML = getScoreBlob().size;
		}
	};

	var playNotes = function () {
		if (!document.getElementById('song-audio').canPlayType('audio/mp3')) {
			/* eslint-disable no-alert */
			window.alert('MP3 audio isn\'t available in this browser, \ntry upgrading to a modern browser.');
			/* eslint-enable no-alert */
			return;
		}

		var musicBlob = getMusicBlob();
		if (musicBlob.size === 0) {
			/* eslint-disable no-alert */
			window.alert('No music file available.');
			/* eslint-enable no-alert */
			return;
		}
		if (dirty) {
			dirty = false;
			var audio = document.getElementById('song-audio');
			audio.src = window.URL.createObjectURL(musicBlob);
			audio.play();
		} else {
			document.getElementById('song-audio').play();
		}
	};

	var saveSong = function () {
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(getMusicBlob(), 'PianoSong.mp3');
		} else {
			/* eslint-disable no-alert */
			window.alert('Sorry this function doesn\'t work in your browser.\nTry upgrading to a modern browser.');
			/* eslint-enable no-alert */
		}
	};

	var saveSheetMusic = function () {
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(getScoreBlob(), 'MusicScore.svg');
		} else {
			/* eslint-disable no-alert */
			window.alert('Sorry this function doesn\'t work in your browser.\nTry upgrading to a modern browser.');
			/* eslint-enable no-alert */
		}
	};

	var getNote = function (note) {
		return notes[note].blob;
	};

	var writeNote = function (note) {
		var data = notes[note];
		var y = data.y;
		var src = data.src;
		if (note.indexOf('sharp') !== -1) {
			position = position + 1;
		}

		var svgNS = 'http://www.w3.org/2000/svg';
		var xlinkNS = 'http://www.w3.org/1999/xlink';

		// if x is to high add a line to the score
		if (position > 44) {
			yOffset = yOffset + 10;
			var use = document.createElementNS(svgNS, 'use');
			use.setAttributeNS(null, 'y', yOffset);
			use.setAttributeNS(xlinkNS, 'xlink:href', '#lines');
			use.setAttribute('class', 'added');
			document.getElementById('scale').appendChild(use);
			var use2 = document.createElementNS(svgNS, 'use');
			use2.setAttributeNS(null, 'y', yOffset);
			use2.setAttributeNS(xlinkNS, 'xlink:href', '#final_line_end');
			use2.setAttribute('class', 'lineEnd added');
			document.getElementById('scale').appendChild(use2);
			document.getElementById('scale').viewBox.baseVal.height += 10;
			position = 0;
			if (yOffset === 10) {
				document.getElementById('score-container').style.height = '320px';
			} else if (yOffset > 11) {
				document.getElementById('score-container').style.height = '450px';
				document.getElementById('scale').style.height = '1000px';
				document.getElementById('score-container').style.overflowY = 'scroll';
				document.getElementById('score-container').scrollTop = document.getElementById('score-container').scrollHeight;
			}

			var lineEnds = document.getElementsByClassName('line-end');
			if (lineEnds.length - 2 >= 0) {
				lineEnds[lineEnds.length - 2].setAttributeNS(xlinkNS, 'xlink:href', '#regular_line_end');
			}
		}

		// create the use element for the svg musical scale.
		var use = document.createElementNS(svgNS, 'use');
		use.setAttributeNS(null, 'x', position);
		use.setAttributeNS(null, 'y', y + yOffset);
		use.setAttributeNS(xlinkNS, 'xlink:href', src);
		use.setAttribute('class', 'added');
		document.getElementById('scale').appendChild(use);

		position = position + 2;
	};

	var addNote = function (n, silent) {
		if ((n.key) && !((n.key === 'Spacebar') || (n.key === 'Enter'))) {
			return;
		}

		var note = n;
		if (!silent) {
			note = n.target.id;
			if (note === '') {
				note = n.target.parentNode.id;
			}
		}

		// add the note to the stored list and play the sound
		var z = getNote(note);
		if (z) {
			musicBlobArray.push(z);
		}

		var audio = document.getElementById(note + '_audio');
		if (audio && !silent) {
			if (audio.canPlayType('audio/mp3')) {
				audio.pause();
				try {
					audio.currentTime = 0;
				} catch (e) { /*window.alert(e);*/
				}
				audio.play();
			} else {
				document.getElementById('audio-warning').style.display = 'block';
			}
		}

		// draw note on the svg scale
		writeNote(note);

		if (!silent) {
			updateFileSizes();
		}
		dirty = true;
	};

	var addBlobNote = function (id, src) {
		var audioContainer = document.getElementById('audio-container');
		var audioElt = document.createElement('audio');
		audioElt.controls = true;
		audioElt.src = src;
		audioElt.id = id;
		audioContainer.appendChild(audioElt);
	};

	var getBlobs = function () {
		var req = new XMLHttpRequest();
		var url = 'pianonotes/allnotes.mp3';
		var data = {};
		req.open('GET', url);
		req.responseType = 'blob';
		req.onload = function () {
			var j = 0;
			var audio = this.response;
			for (var i = 0; i < notes.length; i++) {
				var note = notes[i];
				var id = note.name + '_audio';
				var src = '';

				if (audio && (audio.size === 190978)) {
					//slice the file
					var endSlice = j + note.size;
					var blob = null;
					if (audio.slice) {
						blob = audio.slice(j, endSlice, audio.type);
					}

					j = endSlice;

					note.blob = blob;

					if (window.URL) {
						src = window.URL.createObjectURL(blob);
					} else {
						if (window.webkitURL) {
							src = window.webkitURL.createObjectURL(blob);
						}
					}
				} else {
					//audio didn't download as a blob
					//var x = [notes[i], null];
					//noteBlobs[i] = x;

					src = 'pianonotes/' + notes[i].name + '.mp3';
					document.getElementById('xhrBlobWarning').style.display = 'block';
				}

				data[note.name] = note;

				addBlobNote(id, src);
			}
			notes = data;
		};
		req.send(null);
	};

	var reset = function () {
		var added = document.querySelectorAll('.added');
		var scale = document.getElementById('scale');
		for (var i = 0; i < added.length; i++) {
			scale.removeChild(added[i]);
		}

		musicBlobArray = [];
		position = 0;
		yOffset = 0;
		dirty = true;
		scale.viewBox.baseVal.height = 8;
		updateFileSizes();

		var xlinkNS = 'http://www.w3.org/1999/xlink';
		document.querySelector('.line-end').setAttributeNS(xlinkNS, 'xlink:href', '#final_line_end');

		document.getElementById('score-container').style.height = '';
		document.getElementById('scale').style.height = '';
		document.getElementById('score-container').style.overflowY = '';
	};

	var setSong = function (val) {
		if (val === 'orig') {
			return;
		}
		reset();
		var song = val.split(',');
		for (var i = 0; i < song.length; i++) {
			addNote(song[i], true);
		}
		document.getElementById('score-container').style.height = '450px';
		updateFileSizes();
	};

	var addEvents = function () {
		document.getElementById('save-song').addEventListener('click', saveSong, false);
		document.getElementById('save-sheet').addEventListener('click', saveSheetMusic, false);
		document.getElementById('reset').addEventListener('click', reset, false);
		document.getElementById('play-button').addEventListener('click', playNotes, false);
		document.getElementById('pause-button').addEventListener('click', function () {
			document.getElementById('song-audio').pause();
		}, false);

		var songAudio = document.getElementById('song-audio');

		songAudio.addEventListener('play', function () {
			document.getElementById('play-button').style.display = 'none';
			document.getElementById('pause-button').style.display = 'block';
		}, false);

		songAudio.addEventListener('pause', function () {
			document.getElementById('play-button').style.display = 'block';
			document.getElementById('pause-button').style.display = 'none';
		}, false);

		songAudio.addEventListener('ended', function () {
			document.getElementById('play-button').style.display = 'block';
			document.getElementById('pause-button').style.display = 'none';
		}, false);

		document.getElementById('song').addEventListener('change', function (evt) {
			setSong(evt.target.value);
		});
	};

	var init = function () {
		try {
			/* eslint-disable no-unused-vars */
			var x = new Blob();
			/* eslint-enable no-unused-vars */
			blobConstSupport = true;
		} catch (e) {
		}

		window.URL = window.URL || window.webkitURL;
		window.BlobBuilder = window.BlobBuilder || window.MSBlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

		if (blobConstSupport || window.BlobBuilder) {
			// BlobBuilder is supported
			getBlobs();
			updateFileSizes();
		} else {
			//hide some elements which require Blob Builder
			var bbReq = document.getElementsByClassName('bb-req');
			for (var i = 0; i < bbReq.length; i++) {
				bbReq[i].style.display = 'none';
			}
			document.getElementById('warning').style.display = 'block';

			//add audio elements with regular source so the sound can play.
			var audioContainer = document.getElementById('audio-container');
			for (var i = 0; i < notes.length; i++) {
				var audio = document.createElement('audio');
				audio.src = 'pianonotes/' + notes[i].name + '.mp3';
				audio.controls = true;
				audio.id = notes[i].name + '_audio';
				audioContainer.appendChild(audio);
			}
		}

		//add event listeners for the Piano Keys
		var keys = document.querySelectorAll('#piano g');
		for (var i = 0; i < keys.length; i++) {
			if (window.navigator.msPointerEnabled) {
				keys[i].addEventListener('MSPointerDown', addNote, false);
			} else {
				keys[i].addEventListener('mousedown', addNote, false);
			}

			keys[i].addEventListener('keydown', addNote, false);
		}
	};

	addEvents();
	init();
}());
