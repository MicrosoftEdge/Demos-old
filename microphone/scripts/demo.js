/*  Microsoft Demo:  Microphone Recorder using GetUserMedia with Web Audio for visualizations & effects

by Jerry Smith

Copyright 2015
Microsoft Corporation
*/

/* global Recorder */

(function() {
'use strict';

	// map prefixed APIs
	navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
														navigator.mozGetUserMedia || navigator.msGetUserMedia);
													
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
	
	//==============================
	// create web audio nodes
	//==============================
	
	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
	// create notch filter for 60 Hz
	var notchFilter = audioContext.createBiquadFilter();
	notchFilter.frequency.value = 60.0;
	notchFilter.type = 'notch';
	notchFilter.Q.value = 10.0;
	
	var micGain = audioContext.createGain();			// for mic input mute
	var sourceMix = audioContext.createGain();			// for mixing
	var visualizerInput = audioContext.createGain();	// final gain for visualizers
	var outputGain = audioContext.createGain();			// for speaker mute
	outputGain.gain.value = 0;							// mute speakers initially
	var dynComp = audioContext.createDynamicsCompressor();	//limit output
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
	if (navigator.getUserMedia) {
		console.log('getUserMedia supported.');
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
				myRecorder = new Recorder(sourceMic);
				console.log('myRecorder initialized');
			},
			
			// handle errors
			function(err) {
				console.log('The following error occured: ' + err);
			}
		);
	} else {
		console.log('getUserMedia not supported!');
	}
	
	var toggleMicMute = function() {
		var micMute = document.getElementById('micMute');
		if (micGain.gain.value === 0) {
			micGain.gain.value = 1;
			micMute.className = 'button mic-controls__button mic-controls__mic-mute';
		} else {
			micGain.gain.value = 0;
			micMute.className = 'button mic-controls__button mic-controls__mic-mute mic-controls__button--selected';
		}
		console.log('mic gain = ' + micGain.gain.value);
	};
	
	var toggleSpeakerMute = function() {
		var speakerMute = document.getElementById('speakerMute');
		if (outputGain.gain.value === 0) {
			outputGain.gain.value = 1;
			speakerMute.className = 'button mic-controls__button mic-controls__speaker-mute';
		} else {
			outputGain.gain.value = 0;
			speakerMute.className = 'button mic-controls__button mic-controls__speaker-mute mic-controls__button--selected';
		}
		console.log('output gain = ' + outputGain.gain.value);
	};

	var stop = function() {
		console.log('stopped');
		if(recording === true) {
			myRecorder.stop();
			myRecorder.exportWAV(function(s) {
				myAudio.src = window.URL.createObjectURL(s);
		});
		}
		myAudio.pause();
		// reset record button
		recording = false;
		button = document.getElementById('recordButton');
		button.className = 'button mic-controls__button mic-controls__record';
		// reset play button
		playing = false;
		button = document.getElementById('playButton');
		button.className = 'button mic-controls__button mic-controls__play';
	};
	
	var toggleRecord = function() {
		if(recording === false) {
			console.log('recording');
			recording = true;
			myRecorder.clear();
			myRecorder.record();
			// change button to 'active'
			button = document.getElementById('recordButton');
			button.className = 'button mic-controls__button mic-controls__record mic-controls__button--selected';
		} else {
			stop();
		}
	};
	
	var togglePlay = function() {
		if(playing === false) {
			stop();
			console.log('playing ' + myAudio.src);
			myAudio.play();
			playing = true;
			// change button to 'active'
			button = document.getElementById('playButton');
			button.className = 'button mic-controls__button mic-controls__play mic-controls__button--selected';
		} else {
			stop();
		}
	};
	
	var playComplete = function() {
		stop();
	};
	
	// toggle loop playback
	var toggleLoop = function() {
		if (myAudio.loop === false) {
			myAudio.loop = true;
			// change button to 'active'
			button = document.getElementById('loopButton');
			button.className = 'button mic-controls__button mic-controls__loop mic-controls__button--selected';
		} else {
			myAudio.loop = false;
			// reset looping button
			button = document.getElementById('loopButton');
			button.className = 'button mic-controls__button mic-controls__loop';
		}
		console.log('audio loop: ' + myAudio.loop);
	};
			
	// save file from url
	var saveToDisk = function(url) {
		var blob = null;
		console.log('saving ' + url);
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'blob';
		xhr.onload = function() {
			if (this.status === 200) {
				blob = this.response;
				console.log('blob = ' + blob);
				// blob is the object the URL pointed to.
				Recorder.saveFile(blob, 'myRecording' + ( (recIndex < 10) ? '0' : '' ) + recIndex + '.wav' );
				recIndex++;
			}
		};
		xhr.send();
	};

	var save = function() {
		stop();
		console.log(myAudio.src);
		saveToDisk(myAudio.src);
	};
		
	// initiate load file by clicking hidden type=file button
	var loadFile = function() {
		stop();
		document.getElementById('loadFiles').click();
	};
	
	// handle details of file load
	var handleFileSelection = function(evt) {		
		var files = evt.target.files;	
		file = files[0];
		var url = URL.createObjectURL(file);
		myAudio.src = url;
		console.log('audio element source is now ' + myAudio.src);
	};
	
	// apply room effect
	var applyEffect = function() {
			
		// available impulse response files
		var effectsArray = [
			'sounds/impulse-response/trigroom.wav',
			'sounds/impulse-response/telephone.wav',
			'sounds/impulse-response/parkinggarage.wav',
			'sounds/impulse-response/muffler.wav'
		];

		var selectedEffect = document.getElementById('effectmic-controls').value;
		console.log('Effect ' + selectedEffect + ' is selected.');
		
		// retrieve the selected impulse response file
		var request = new XMLHttpRequest();
		request.open('GET', effectsArray[selectedEffect], true);
		request.responseType = 'arraybuffer';
		
		// decode it and set it as the convolver buffer
		request.onload = function(){
			audioContext.decodeAudioData(request.response, function(buffer){
				if (!buffer){
					alert('error decoding file data');
					return;
				}
				convolver.buffer = buffer;
			},
			function(error){
				console.error('decodeAudioData error', error);
			});
		};
			
		request.onerror = function(){
			alert('XHR error');
		};
		request.send();
	};
	
	// apply filter
	var applyFilter = function() {
		
		// available impulse response files
		var filterArray = [
			['allpass', 20000, 1],
			['lowpass', 500, 1],
			['highpass', 3000, 1],
			['bandpass', 4000, 10]
		];

		var selectedFilter = document.getElementById('filtermic-controls').value;
		filter.type = filterArray[selectedFilter][0];
		filter.frequency.value = filterArray[selectedFilter][1];
		filter.Q.value = filterArray[selectedFilter][2];

		console.log('filter ' + selectedFilter + ' is selected.');
		console.log('filter is ' + filter.type + ' with frequency ' + filter.frequency.value);
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
		
		console.log(freqCanvas.width, freqCanvas.height);
		
		// time visualization prep
		timeAnalyser.fftSize = 2048;
		var timeBufferLength = timeAnalyser.fftSize;
		console.log(timeBufferLength);
		var timeDataArray = new Uint8Array(timeBufferLength);
		
		timeCanvasContext.clearRect(0, 0, TIMEWIDTH, TIMEHEIGHT);
		
		// frequency visualization prep
		freqAnalyser.fftSize = 256;
		var freqBufferLength = freqAnalyser.frequencyBinCount;
		console.log(freqBufferLength);
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