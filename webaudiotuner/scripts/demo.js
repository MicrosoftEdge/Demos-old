/* global $, Gauge */
$(document).ready(function () {
	'use strict';

	var baseFreq = 440;
	var currentNoteIndex = 57; // A4
	var isRefSoundPlaying = false;
	var isMicrophoneInUse = false;
	var frameId,
		freqTable,
		gauge,
		micStream,
		notesArray,
		audioContext,
		sourceAudioNode,
		analyserAudioNode;

	var isAudioContextSupported = function () {
		// This feature is still prefixed in Safari
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		if (window.AudioContext) {
			return true;
		}
		else {
			return false;
		}
	};

	var reportError = function (message) {
		$('#errorMessage').html(message).show();
	};

	var init = function () {
		$.getJSON('notes.json', function (data) {
			freqTable = data;
		});

		$('.tuner__options').toggle(false);

		var gaugeCanvas = $('#gaugeCanvas')[0];
		gauge = new Gauge(gaugeCanvas).setOptions({
			strokeColor: '#dedede',
			pointer: {
				length: 0.8,
				strokeWidth: 0.035
			},
			angle: 0,
			lineWidth: 0.30,
			fontSize: 30,
			limitMax: true
		});
		gauge.maxValue = 100;

		// This gauge control does not look good in all browsers if set to 0 from the beginning.
		// Setting it to 1 and then to 0 solves this.
		gauge.set(1);
		gauge.set(0);

		if (isAudioContextSupported()) {
			audioContext = new window.AudioContext();
		}
		else {
			reportError('AudioContext is not supported in this browser');
		}
	};

	var updatePitch = function (pitch) {
		$('#pitch').text(pitch + ' Hz');
	};

	var updateNote = function (note) {
		$('#note').text(note);
	};

	var updateCents = function (cents) {
		// We may get negative values here.
		// Add 50 cents to what we get
		gauge.set(cents + 50);
		$('#cents').text(cents);
	};

	var isGetUserMediaSupported = function () {
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		if ((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || navigator.getUserMedia) {
			return true;
		}

		return false;
	};

	var findFundamentalFreq = function (buffer, sampleRate) {
		// We use Autocorrelation to find the fundamental frequency.

		// In order to correlate the signal with itself (hence the name of the algorithm), we will check two points 'k' frames away.
		// The autocorrelation index will be the average of these products. At the same time, we normalize the values.
		// Source: http://www.phy.mty.edu/~suits/autocorrelation.html
		// Assuming the sample rate is 48000Hz, a 'k' equal to 1000 would correspond to a 48Hz signal (48000/1000 = 48),
		// while a 'k' equal to 8 would correspond to a 6000Hz one, which is enough to cover most (if not all)
		// the notes we have in the notes.json file.
		var n = 1024;
		var bestK = -1;
		var bestR = 0;
		for (var k = 8; k <= 1000; k++) {
			var sum = 0;

			for (var i = 0; i < n; i++) {
				sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128);
			}

			var r = sum / (n + k);

			if (r > bestR) {
				bestR = r;
				bestK = k;
			}

			if (r > 0.9) {
				// Let's assume that this is good enough and stop right here
				break;
			}
		}

		if (bestR > 0.0025) {
			// The period (in frames) of the fundamental frequency is 'bestK'. Getting the frequency from there is trivial.
			var fundamentalFreq = sampleRate / bestK;
			return fundamentalFreq;
		}
		else {
			// We haven't found a good correlation
			return -1;
		}
	};

	var findClosestNote = function (freq, notes) {
		// Use binary search to find the closest note
		var low = -1;
		var high = notes.length;
		while (high - low > 1) {
			var pivot = Math.round((low + high) / 2);
			if (notes[pivot].frequency <= freq) {
				low = pivot;
			} else {
				high = pivot;
			}
		}

		if (Math.abs(notes[high].frequency - freq) <= Math.abs(notes[low].frequency - freq)) {
			// notes[high] is closer to the frequency we found
			return notes[high];
		}

		return notes[low];
	};

	var findCentsOffPitch = function (freq, refFreq) {
		// We need to find how far freq is from baseFreq in cents
		var log2 = 0.6931471805599453; // Math.log(2)
		var multiplicativeFactor = freq / refFreq;

		// We use Math.floor to get the integer part and ignore decimals
		var cents = Math.floor(1200 * (Math.log(multiplicativeFactor) / log2));
		return cents;
	};

	var detectPitch = function () {
		var buffer = new Uint8Array(analyserAudioNode.fftSize);
		analyserAudioNode.getByteTimeDomainData(buffer);

		var fundalmentalFreq = findFundamentalFreq(buffer, audioContext.sampleRate);

		if (fundalmentalFreq !== -1) {
			var note = findClosestNote(fundalmentalFreq, notesArray);
			var cents = findCentsOffPitch(fundalmentalFreq, note.frequency);
			updateNote(note.note);
			updateCents(cents);
		}
		else {
			updateNote('--');
			updateCents(-50);
		}

		frameId = window.requestAnimationFrame(detectPitch);
	};

	var streamReceived = function (stream) {
		micStream = stream;

		analyserAudioNode = audioContext.createAnalyser();
		analyserAudioNode.fftSize = 2048;

		sourceAudioNode = audioContext.createMediaStreamSource(micStream);
		sourceAudioNode.connect(analyserAudioNode);

		detectPitch();
	};

	var turnOffReferenceSound = function () {
		sourceAudioNode.stop();
		sourceAudioNode = null;
		updatePitch('--');
		updateNote('--');
		$('#referenceOptions').toggle(false);
		isRefSoundPlaying = false;
	};

	var turnOffMicrophone = function () {
		if (sourceAudioNode && sourceAudioNode.mediaStream && sourceAudioNode.mediaStream.stop) {
			sourceAudioNode.mediaStream.stop();
		}
		sourceAudioNode = null;
		updatePitch('--');
		updateNote('--');
		updateCents(-50);
		$('#microphoneOptions').toggle(false);
		analyserAudioNode = null;
		window.cancelAnimationFrame(frameId);
		isMicrophoneInUse = false;
	};

	var toggleMicrophone = function () {
		if (isRefSoundPlaying) {
			turnOffReferenceSound();
		}

		if (!isMicrophoneInUse) {
			$('#microphoneOptions').toggle(true);

			if (isGetUserMediaSupported()) {
				notesArray = freqTable[baseFreq.toString()];

				var getUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia ?
					navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices) :
					function (constraints) {
						return new Promise(function (resolve, reject) {
							navigator.getUserMedia(constraints, resolve, reject);
						});
					};

				getUserMedia({audio: true}).then(streamReceived).catch(reportError);
				updatePitch(baseFreq);
				isMicrophoneInUse = true;
			}
			else {
				reportError('It looks like this browser does not support getUserMedia. ' +
				'Check <a href="http://caniuse.com/#feat=stream">http://caniuse.com/#feat=stream</a> for more info.');
			}
		}
		else {
			turnOffMicrophone();
		}
	};

	var toggleReferenceSound = function () {
		if (isMicrophoneInUse) {
			toggleMicrophone();
		}

		if (!isRefSoundPlaying) {
			$('#referenceOptions').toggle(true);
			notesArray = freqTable[baseFreq];
			sourceAudioNode = audioContext.createOscillator();
			sourceAudioNode.frequency.value = notesArray[currentNoteIndex].frequency;
			sourceAudioNode.connect(audioContext.destination);
			sourceAudioNode.start();
			updatePitch(notesArray[currentNoteIndex].frequency);
			updateNote(notesArray[currentNoteIndex].note);
			isRefSoundPlaying = true;
		} else {
			turnOffReferenceSound();
		}
	};

	var changeBaseFreq = function (delta) {
		var newBaseFreq = baseFreq + delta;
		if (newBaseFreq >= 432 && newBaseFreq <= 446) {
			baseFreq = newBaseFreq;
			notesArray = freqTable[baseFreq.toString()];
			updatePitch(baseFreq);

			if (isRefSoundPlaying) {
				// Only change the frequency if we are playing a reference sound, since
				// sourceAudioNode will be an instance of OscillatorNode
				var newNoteFreq = notesArray[currentNoteIndex].frequency;
				sourceAudioNode.frequency.value = newNoteFreq;
			}
		}
	};

	var changeReferenceSoundNote = function (delta) {
		if (isRefSoundPlaying) {
			var newNoteIndex = currentNoteIndex + delta;
			if (newNoteIndex >= 0 && newNoteIndex < notesArray.length) {
				currentNoteIndex = newNoteIndex;
				var newNoteFreq = notesArray[currentNoteIndex].frequency;
				sourceAudioNode.frequency.value = newNoteFreq;
				// In this case we haven't changed the base frequency, so we just need to update the note on screen
				updateNote(notesArray[currentNoteIndex].note);
			}
		}
	};

	var baseFreqChangeHandler = function (event) {
		changeBaseFreq(event.data);
	};

	var referenceSoundNoteHandler = function (event) {
		changeReferenceSoundNote(event.data);
	};

	$('#refButton').click(toggleReferenceSound);
	$('#micButton').click(toggleMicrophone);
	$('.minusFreq').click(-2, baseFreqChangeHandler);
	$('.plusFreq').click(2, baseFreqChangeHandler);
	$('#refDecreaseNoteButton').click(-1, referenceSoundNoteHandler);
	$('#refIncreaseNoteButton').click(1, referenceSoundNoteHandler);

	init();
});
