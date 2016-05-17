// Testing for browser support
var speechSynthesisSupported = 'speechSynthesis' in window;

var isPaused = false;
var isPlaying = false;

// Getting html elements
var supportMessage = document.getElementById("supportMessage");
var speakBtn = document.getElementById("speakBtn");
var pauseresumeBtn = document.getElementById("pauseresumeBtn");
var cancelBtn = document.getElementById("cancelBtn");
var textToSpeech = document.getElementById("textToSpeech");
var voiceSelect = document.getElementById("voice");
var langSelect = document.getElementById("language");
var volumeRange = document.getElementById("volume");
var rateRange = document.getElementById("rate");
var pitchRange = document.getElementById("pitch");
var speechStatus = document.getElementById("speechStatus");

if (speechSynthesisSupported) {
    supportMessage.innerHTML = "Your browser <strong>supports</strong> the speech synthesis.";
} else {
    supportMessage.innerHTML = "Your browser <strong>does not support</strong> speech synthesis.";
    supportMessage.classList.add("unSupported");
}

// Loading available voices for this browser/platform
// And displaying them into the combobox
function loadVoices() {
	var voices = speechSynthesis.getVoices();
  
	voices.forEach((voice, i) => {
		var option = document.createElement("option");
		option.value = voice.name;
		option.innerHTML = voice.name;
		voiceSelect.appendChild(option);
	});
}

if (speechSynthesisSupported) { 
    loadVoices();

    // Chrome loads voices asynchronously.
    window.speechSynthesis.onvoiceschanged = (e) => {
        loadVoices();
    };

}

function speak(textToSpeech) {
	var synUtterance = new SpeechSynthesisUtterance();
	synUtterance.text = textToSpeech;
	if (voiceSelect.value) {
	    synUtterance.voice = speechSynthesis.getVoices().filter(function (voice) { return voice.name == voiceSelect.value; })[0];
	}
	synUtterance.lang = langSelect.value;
	synUtterance.volume = parseFloat(volumeRange.value);
	synUtterance.rate = parseFloat(rateRange.value);
	synUtterance.pitch = parseFloat(pitchRange.value);

	const eventList = ["start", "end", "mark", "pause", "resume", "error", "boundary"];
	eventList.forEach((event) => {
	    synUtterance.addEventListener(event, (speechSynthesisEvent) => {
	        log(`Fired '${speechSynthesisEvent.type}' event at time '${speechSynthesisEvent.elapsedTime}' and character '${speechSynthesisEvent.charIndex}'.`);
	    });
	});

	window.speechSynthesis.speak(synUtterance);
}

function log(message) {
    console.log(`${message}<br/>`);
}

if (speechSynthesisSupported) {
    speakBtn.addEventListener('click', (e) => {
        if (textToSpeech.value.length > 0) {
            speak(textToSpeech.value);
        }
    });

    pauseresumeBtn.addEventListener('click', (e) => {
        if (!isPaused) {
            window.speechSynthesis.pause();
            isPaused = true;
            pauseresumeBtn.textContent = "Resume";
        }
        else {
            window.speechSynthesis.resume();
            isPaused = false;
            pauseresumeBtn.textContent = "Pause";
        }
    });

    cancelBtn.addEventListener('click', (e) => {
        window.speechSynthesis.cancel();
    });

    setInterval(() => {
        if (speechSynthesis.speaking) {
            speechStatus.style.visibility = "visible";
            speechStatus.style.width = "32px";
            if (!isPlaying) {
                speechStatus.src = "playingsound.gif";
                isPlaying = true;
            }
            if (speechSynthesis.paused) {
                speechStatus.src = "pauseicon.png";
                isPlaying = false;
            }
        }
        else {
            isPlaying = false;
            speechStatus.src = "";
            speechStatus.style.visibility = "hidden";
        }
    }, 100)
}