/*eslint-env es6 */
(function () {
	'use strict';

	// Testing for browser support
	const speechSynthesisSupported = 'speechSynthesis' in window;

	let isPaused = false;
	let isPlaying = false;

	// Getting html elements
	const supportMessageEle = document.getElementById('support-message');
	const speakBtn = document.getElementById('speak-btn');
	const pauseresumeBtn = document.getElementById('pauseresume-btn');
	const cancelBtn = document.getElementById('cancel-btn');
	const textToSpeechEle = document.getElementById('text-to-speech');
	const voiceSelect = document.getElementById('voice');
	const langSelect = document.getElementById('language');
	const volumeRange = document.getElementById('volume');
	const rateRange = document.getElementById('rate');
	//	var pitchRange = document.getElementById('pitch');
	const speechStatus = document.getElementById('speech-status');

	const log = function (message) {
		console.log(`${message}<br/>`);
	};

	if (speechSynthesisSupported) {
		supportMessageEle.innerHTML = 'Your browser <strong>supports</strong> the speech synthesis.';
	} else {
		supportMessageEle.innerHTML = 'Your browser <strong>does not support</strong> speech synthesis.';
		supportMessageEle.classList.add('unSupported');
	}

	// Generic function to remove all options from a select
	const clearSelect = function(selectObject) {
		while (selectObject.length > 0) {
			selectObject.remove(selectObject.length - 1);
		}
	};

	// Clear combobox then add voice options
	const displayVoices = function(voices) {
		const lastSelectedVoiceName = voiceSelect.value;
		clearSelect(voiceSelect);
		voices.forEach((voice) => {
			const option = document.createElement('option');
			option.value = voice.name;
			option.innerHTML = voice.name;
			option.id = voice.name;
			voiceSelect.appendChild(option);
		});

		if (lastSelectedVoiceName && voiceSelect.options.namedItem(lastSelectedVoiceName)) {
			voiceSelect.value = lastSelectedVoiceName;
		}
	};

	// Loading available voices for this browser/platform
	// And displaying them into the combobox
	const loadVoices = function () {
		const voices = speechSynthesis.getVoices();

		if (voices.length > 0) {
			displayVoices(voices);
		}
	};

	const speak = function (textToSpeech) {
		const synUtterance = new SpeechSynthesisUtterance();
		synUtterance.text = textToSpeech;
		if (voiceSelect.value) {
			synUtterance.voice = speechSynthesis
				.getVoices()
				.filter(function (voice) {
					return voice.name === voiceSelect.value;
				})[0];
		}
		synUtterance.lang = langSelect.value;
		synUtterance.volume = parseFloat(volumeRange.value);
		synUtterance.rate = parseFloat(rateRange.value);
		//	synUtterance.pitch = parseFloat(pitchRange.value);

		const eventList = ['start', 'end', 'mark', 'pause', 'resume', 'error', 'boundary'];
		eventList.forEach((event) => {
			synUtterance.addEventListener(event, (speechSynthesisEvent) => {
				log(`Fired '${speechSynthesisEvent.type}' event at time '${speechSynthesisEvent.elapsedTime}' and character '${speechSynthesisEvent.charIndex}'.`);
			});
		});

		window.speechSynthesis.speak(synUtterance);
	};

	if (speechSynthesisSupported) {
		loadVoices();

		// Chrome loads voices asynchronously.
		window.speechSynthesis.onvoiceschanged = () => {
			loadVoices();
		};
	}

	if (speechSynthesisSupported) {
		speakBtn.addEventListener('click', () => {
			if (textToSpeechEle.value.length > 0) {
				speak(textToSpeechEle.value);
			}
		});

		pauseresumeBtn.addEventListener('click', () => {
			if (!isPaused) {
				window.speechSynthesis.pause();
				isPaused = true;
				pauseresumeBtn.textContent = 'Resume';
			} else {
				window.speechSynthesis.resume();
				isPaused = false;
				pauseresumeBtn.textContent = 'Pause';
			}
		});

		cancelBtn.addEventListener('click', () => {
			window.speechSynthesis.cancel();
		});

		setInterval(() => {
			if (speechSynthesis.speaking) {
				speechStatus.style.visibility = 'visible';
				speechStatus.style.width = '32px';
				if (!isPlaying) {
					speechStatus.src = 'images/playingsound.gif';
					isPlaying = true;
				}
				if (speechSynthesis.paused) {
					speechStatus.src = 'images/pauseicon.png';
					isPlaying = false;
				}
			} else {
				isPlaying = false;
				speechStatus.src = '';
				speechStatus.style.visibility = 'hidden';
			}
		}, 100);
	}
}());
