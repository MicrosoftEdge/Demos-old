/*  Microsoft Demo:  Microphone Recorder using GetUserMedia with Web Audio for visualizations & effects

by Jerry Smith

Copyright 2015
Microsoft Corporation
*/

/* global Recorder */

(function() {
'use strict';

	var notSupported = function() {
		var msg = document.getElementById('alert-banner');
		msg.style.display = 'block';
		var sb = document.getElementById('start');
		sb.style.display = 'none';
		var db = document.getElementById('demo-banner');
		db.style.display = 'none';
	};

	if(window.AudioContext || window.webkitAudioContext) {
		var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	} else {
		notSupported();
		return;
	}

	// map prefixed APIs
	navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

	// define global variables
	var file = null;
	var button = null;
	var recIndex = 0;
	var sourceMic = null;
	var sourceAudio = null;
	var myRecorder = null;
	var recording = false;
	var playing = false;
	var myAudio = document.getElementById('demoAudio');
	var noSrc = true;

	//==============================
	// create web audio nodes
	//==============================

	// create notch filter for 60 Hz
	var notchFilter = audioContext.createBiquadFilter();
	notchFilter.frequency.value = 60.0;
	notchFilter.type = 'notch';
	notchFilter.Q.value = 10.0;

	var micGain = audioContext.createGain();				// for mic input mute
	var sourceMix = audioContext.createGain();				// for mixing
	var visualizerInput = audioContext.createGain();		// final gain for visualizers
	var outputGain = audioContext.createGain();				// for speaker mute
	outputGain.gain.value = 0;								// mute speakers initially
	var dynComp = audioContext.createDynamicsCompressor();	// limit output
	visualizerInput.gain.value = 5;

	// create a convolver node for room effects
	var convolver = audioContext.createConvolver();

	// create a biquadfilter node for filtering
	var filter = audioContext.createBiquadFilter();

	// create analyzer nodes for visualizations
	var timeAnalyser = audioContext.createAnalyser();
	timeAnalyser.minDecibels = -90;
	timeAnalyser.maxDecibels = -10;
	timeAnalyser.smoothingTimeConstant = 0.85;

	var freqAnalyser = audioContext.createAnalyser();
	freqAnalyser.minDecibels = -90;
	freqAnalyser.maxDecibels = -10;
	freqAnalyser.smoothingTimeConstant = 0.85;

	// set up canvas contexts for visualizations
	var freqCanvas = document.querySelector('.mic-vis__frequency');
	var freqCanvasContext = freqCanvas.getContext('2d');
	var timeCanvas = document.querySelector('.mic-vis__time');
	var timeCanvasContext = timeCanvas.getContext('2d');
	var intendedWidth = document.querySelector('.container').clientWidth;
	freqCanvas.setAttribute('width', intendedWidth);
	timeCanvas.setAttribute('width', intendedWidth);

	//==============================
	//	build audio graph
	//==============================
	var runRecorder = function() {
		if (navigator.getUserMedia) {
			navigator.getUserMedia(
				{
					'audio': true
				},

				// build audio graph with media stream and audio element as sources
				function(stream) {

					// initialize mic source
					sourceMic = audioContext.createMediaStreamSource(stream);

					// initialize audio element source
					sourceAudio = audioContext.createMediaElementSource(myAudio);

					// mix sources
					sourceMic.connect(notchFilter);
					notchFilter.connect(micGain);
					micGain.connect(sourceMix);
					sourceAudio.connect(sourceMix);

					// connect source through filter and convolver to visualizer & output
					sourceMix.connect(convolver);
					convolver.connect(filter);
					filter.connect(visualizerInput);
					filter.connect(outputGain);
					outputGain.connect(dynComp);
					dynComp.connect(audioContext.destination);

					// connect output to visualizers
					visualizerInput.connect(timeAnalyser);
					visualizerInput.connect(freqAnalyser);

					// initialize myRecorder (using recorder.js and recordworker.js)
					myRecorder = new Recorder(sourceMix);
				},
				function(error) {
					notSupported();
					return;
				}
			);
		}
	};

    var demoSetup = function() {
		var sb = document.getElementById('start');
		sb.style.display = 'none';
		var db = document.getElementById('demo-banner');
		db.style.display = 'block';
		runRecorder();
	};

	var startButton = document.getElementById('start');
	startButton.style.display = 'block';
	startButton.addEventListener('click', demoSetup, false);

	var demoBanner = document.getElementById('demo-banner');
	demoBanner.style.display = 'none';

	var toggleGainState = function(elementId, elementClass, outputElement){
		var ele = document.getElementById(elementId);
		return function(){
			if (outputElement.gain.value === 0) {
				outputElement.gain.value = 1;
				ele.classList.remove(elementClass);
			} else {
				outputElement.gain.value = 0;
				ele.classList.add(elementClass);
			}
		};
	};

	var toggleSpeakerMute = toggleGainState('speakerMute', 'mic-controls__button--selected', outputGain);
	var toggleMicMute = toggleGainState('micMute', 'mic-controls__button--selected', micGain);

	var toggleLoopState = function(elementId, elementClass, outputElement){
		var ele = document.getElementById(elementId);
		return function(){
			if (outputElement.loop === true) {
				outputElement.loop = false;
				ele.classList.remove(elementClass);
			} else {
				outputElement.loop = true;
				ele.classList.add(elementClass);
			}
		};
	};

	var toggleLoop = toggleLoopState('loopButton', 'mic-controls__button--selected', myAudio);

	var stop = function() {
		if(recording === true) {
			myRecorder.stop();
			myRecorder.exportWAV(function(s) {
				myAudio.src = window.URL.createObjectURL(s);
				noSrc = false;
			});
		}
		myAudio.pause();
		// reset record button
		recording = false;
		button = document.getElementById('recordButton');
		button.classList.remove('mic-controls__button--selected');
		button.classList.add('mic-controls__record');
		// reset play button
		playing = false;
		button = document.getElementById('playButton');
		button.classList.remove('mic-controls__button--selected');
		button.classList.add('mic-controls__play');
	};

	var toggleRecord = function() {
		if(recording === false) {
			recording = true;
			myRecorder.clear();
			myRecorder.record();
			// change button to 'active'
			button = document.getElementById('recordButton');
			button.classList.add('mic-controls__button--selected');
		} else {
			stop();
		}
	};

	var togglePlay = function() {
		if(noSrc === false && playing === false && recording !== true) {
			stop();
			myAudio.play();
			playing = true;
			// change button to 'active'
			button = document.getElementById('playButton');
			button.classList.add('mic-controls__button--selected');
		} else {
			stop();
		}
	};

	var playComplete = function() {
		stop();
	};

	// save file from url
	var saveToDisk = function(url) {
		var blob = null;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';
		xhr.onload = function() {
			if (this.status === 200) {
				blob = this.response;
				// blob is the object the URL pointed to.
				Recorder.saveFile(blob, 'myRecording' + ( (recIndex < 10) ? '0' : '' ) + recIndex + '.wav' );
				recIndex++;
			}
		};
		xhr.send();
	};

	var save = function() {
		stop();
		saveToDisk(myAudio.src);
	};

	// initiate load file by clicking hidden type=file button
	var loadFile = function() {
		stop();
		document.getElementById('loadFiles').click();
		noSrc = false;
	};

	// handle details of file load
	var handleFileSelection = function(evt) {
		var files = evt.target.files;
		file = files[0];
		var url = URL.createObjectURL(file);
		myAudio.src = url;
	};

	var effects = {
		none: {
			file: 'sounds/impulse-response/trigroom.wav'
		},
		telephone: {
			file: 'sounds/impulse-response/telephone.wav'
		},
		garage: {
			file: 'sounds/impulse-response/parkinggarage.wav'
		},
		muffler: {
			file: 'sounds/impulse-response/muffler.wav'
		}
	};

	// apply room effect
	var applyEffect = function() {
		var effectName = document.getElementById('effectmic-controls').value;
		var selectedEffect = effects[effectName];
		var effectFile = selectedEffect.file;

		// retrieve the selected impulse response file
		var request = new XMLHttpRequest();
		request.open('GET', effectFile, true);

		request.responseType = 'arraybuffer';

		// decode it and set it as the convolver buffer
		request.onload = function(){
			audioContext.decodeAudioData(request.response, function(buffer){
				if (!buffer){
					return;
				}
				convolver.buffer = buffer;
			},
			function(error){
				return;
			});
		};
		request.send();
	};

	// apply filter

	var filters = {
		allpass: {
			frequency: 20000,
			Q: 1
		},
		lowpass: {
			frequency: 400,
			Q: 1
		},
		highpass: {
			frequency: 3000,
			Q: 1
		},
		bandpass: {
			frequency: 1500,
			Q: 5
		}
	};

	var applyFilter = function() {
		var filterName = document.getElementById('filtermic-controls').value;
		var selectedFilter = filters[filterName];
		filter.type = filterName;
		filter.frequency.value = selectedFilter.frequency;
		filter.Q.value = selectedFilter.Q;
	};

	// define controls
	window.onload = function() {
		document.getElementById('demoAudio').onended = playComplete;
		document.getElementById('micMute').onclick = toggleMicMute;
		document.getElementById('speakerMute').onclick = toggleSpeakerMute;
		document.getElementById('recordButton').onclick = toggleRecord;
		document.getElementById('playButton').onclick = togglePlay;
		document.getElementById('saveButton').onclick = save;
		document.getElementById('loadButton').onclick = loadFile;
		document.getElementById('loopButton').onclick = toggleLoop;
		document.getElementById('effectmic-controls').onchange = applyEffect;
		document.getElementById('filtermic-controls').onchange = applyFilter;
	};

	//=============================
	// visualize stream
	//=============================

	var visualize = function() {
		var FREQWIDTH = freqCanvas.width;
		var FREQHEIGHT = freqCanvas.height;
		var TIMEWIDTH = timeCanvas.width;
		var TIMEHEIGHT = timeCanvas.height;

		// time visualization prep
		timeAnalyser.fftSize = 2048;
		var timeBufferLength = timeAnalyser.fftSize;
		var timeDataArray = new Uint8Array(timeBufferLength);

		timeCanvasContext.clearRect(0, 0, TIMEWIDTH, TIMEHEIGHT);

		// frequency visualization prep
		freqAnalyser.fftSize = 256;
		var freqBufferLength = freqAnalyser.frequencyBinCount;
		var freqDataArray = new Uint8Array(freqBufferLength);

		freqCanvasContext.clearRect(0, 0, FREQWIDTH, FREQHEIGHT);

		// create time based visualization
		var drawTime = function() {
			requestAnimationFrame(drawTime);
			timeAnalyser.getByteTimeDomainData(timeDataArray);

			timeCanvasContext.fillStyle = 'rgb(0, 0, 0)';
			timeCanvasContext.fillRect(0, 0, TIMEWIDTH, TIMEHEIGHT);

			timeCanvasContext.lineWidth = 2;
			timeCanvasContext.strokeStyle = 'rgb(179, 252, 254)';

			timeCanvasContext.beginPath();

			var sliceWidth = TIMEWIDTH * 1.0 / timeBufferLength;
			var x = 0;

			for(var i = 0; i < timeBufferLength; i++) {

				var v = timeDataArray[i] / 128.0;
				var y = v * TIMEHEIGHT / 2;

				if (i === 0) {
					timeCanvasContext.moveTo(x, y);
				} else {
					timeCanvasContext.lineTo(x, y);
				}

				x += sliceWidth;
			}

			timeCanvasContext.lineTo(timeCanvas.width, timeCanvas.height / 2);
			timeCanvasContext.stroke();
		};

		// create frequency based visualization
		var drawFreq = function() {
			requestAnimationFrame(drawFreq);
			freqAnalyser.getByteFrequencyData(freqDataArray);

			freqCanvasContext.fillStyle = 'rgb(0, 0, 0)';
			freqCanvasContext.fillRect(0, 0, FREQWIDTH, FREQHEIGHT);

			var barWidth = (FREQWIDTH / freqBufferLength);
			var barHeight;
			var x = 0;

			for(var i = 0; i < freqBufferLength; i++) {
				barHeight = 1.5 * freqDataArray[i];

			// blue bars for low signal, red for high
			freqCanvasContext.fillStyle = 'rgb(' + (179 + barHeight / 1.5) + ', ' + (252 - barHeight / 1.5) + ', 254)';
				freqCanvasContext.fillRect(x, FREQHEIGHT - barHeight / 2, barWidth, barHeight / 2);

				x += barWidth + 1;
			}
		};
		drawTime();
		drawFreq();
	};

	applyEffect();
	applyFilter();
	visualize();

	var init = function() {
		document.getElementById('loadFiles').addEventListener('change', handleFileSelection, false);
	};

	window.addEventListener('load', init, false);

	return true;
}());
