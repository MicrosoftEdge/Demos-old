function Characters() {

    this.penguinContainer;

    this.chromePenguin;
    this.firefoxPenguin;
    this.iePenguin;
    this.operaPenguin;
    this.safariPenguin;
    this.penguinContainer;

    this.chromePenguinBeak;
    this.firefoxPenguinBeak;
    this.iePenguinBeak;
    this.operaPenguinBeak;
    this.safariPenguinBeak;

    this.callback;
    this.callbackIndex;

    this.bordersVisible = false;

    this.callbacks = [
        //      Chrome          FF              IE              Opera           Safari          Rotate
        [0,     false,  true,   false,  true,   false,  true,   false,  true,   false,  true,   true,],
        [3850,  true,   true,   false,  true,   true,   true,   true,   true,   false,  true,   false],
        [4200,  false,  true,   true,   true,   true,   true,   true,   true,   false,  true,   false],
        [5150,  true,   true,   true,   true,   true,   true,   false,  true,   false,  true,   false],
        [5110,  true,   true,   false,  true,   false,  true,   true,   true,   false,  true,   false],
        [4250,  false,  true,   true,   true,   true,   true,   false,  true,   false,  true,   false],
        [5000,  false,  true,   false,  true,   false,  true,   false,  true,   true,   true ,  false],
        [5000,  true,   true,   true,   true,   true,   true,   true,   true,   false,  true,   false],
        [9200,  false,  false,  false,  false,  false,  false,  false,  false,  false,  false,  false],
        [2000,  true,   false,  true,   false,  true,   false,  true,   false,  true,   false,  false],
        [4200,  false,  false,  false,  false,  false,  false,  false,  false,  false,  false,  true]
    ];

    this.Initialize();

    this.Resize = function () {
        this.penguinContainer.style.top = "0px";
        this.penguinContainer.style.left = "0px";
        this.penguinContainer.style.width = sceneWidth + "px";
        this.penguinContainer.style.height = sceneHeight + "px";
    }

    this.Start = function () {
        this.chromePenguin.style.visibility = "visible";
        this.firefoxPenguin.style.visibility = "visible";
        this.iePenguin.style.visibility = "visible";
        this.operaPenguin.style.visibility = "visible";
        this.safariPenguin.style.visibility = "visible";
        this.callback = setTimeout(function () { characters.Update(); }, 1000);
    }

    this.Stop = function () {
        this.HideChromePenguin();
        this.HideFirefoxPenguin();
        this.HideIEPenguin();
        this.HideOperaPenguin();
        this.HideSafariPenguin();
        clearTimeout(this.callbackIndex);
    }

    this.Update = function () {
        if (this.callbacks[this.callbackIndex][1]) { this.ShowChromePenguin(); } else { this.HideChromePenguin(); }
        if (this.callbacks[this.callbackIndex][2]) { this.StartChromePenguinSinging(); } else { this.StopChromePenguinSinging(); }
        if (this.callbacks[this.callbackIndex][3]) { this.ShowFirefoxPenguin(); } else { this.HideFirefoxPenguin(); }
        if (this.callbacks[this.callbackIndex][4]) { this.StartFirefoxPenguinSinging(); } else { this.StopFirefoxPenguinSinging(); }
        if (this.callbacks[this.callbackIndex][5]) { this.ShowIEPenguin(); } else { this.HideIEPenguin(); }
        if (this.callbacks[this.callbackIndex][6]) { this.StartIEPenguinSinging(); } else { this.StopIEPenguinSinging(); }
        if (this.callbacks[this.callbackIndex][7]) { this.ShowOperaPenguin(); } else { this.HideOperaPenguin(); }
        if (this.callbacks[this.callbackIndex][8]) { this.StartOperaPenguinSinging(); } else { this.StopOperaPenguinSinging(); }
        if (this.callbacks[this.callbackIndex][9]) { this.ShowSafariPenguin(); } else { this.HideSafariPenguin(); }
        if (this.callbacks[this.callbackIndex][10]) { this.StartSafariPenguinSinging(); } else { this.StopSafariPenguinSinging(); }
        if (this.callbacks[this.callbackIndex][11]) { this.penguinContainer.className = "PenguinContainerRotateClockwise"; }
        if (this.callbackIndex < this.callbacks.length - 1) {
            this.callbackIndex++;
            this.callback = setTimeout(function () { characters.Update(); }, this.callbacks[this.callbackIndex][0]);
        }
    }

}


Characters.prototype.Initialize = function () {
    this.penguinContainer = document.getElementById("PenguinContainer");
    this.firefoxPenguin = document.getElementById("PenguinFirefoxContainer");
    this.firefoxPenguinBeak = document.getElementById("PenguinFirefoxBeakLower");
    this.iePenguin = document.getElementById("PenguinIEContainer");
    this.iePenguinBeak = document.getElementById("PenguinIEBeakLower");
    this.operaPenguin = document.getElementById("PenguinOperaContainer");
    this.operaPenguinBeak = document.getElementById("PenguinOperaBeakLower");
    this.safariPenguin = document.getElementById("PenguinSafariContainer");
    this.safariPenguinBeak = document.getElementById("PenguinSafariBeakLower");
    this.chromePenguin = document.getElementById("PenguinChromeContainer");
    this.chromePenguinBeak = document.getElementById("PenguinChromeBeakLower");
    this.penguinContainer = document.getElementById("PenguinContainer");
    this.callbackIndex = 0;
};


// Internet Exlorer Animations

Characters.prototype.ShowIEPenguin = function () {
    this.iePenguin.className = "PenguinIEAnimateOnScreen";
};

Characters.prototype.HideIEPenguin = function () {
    this.iePenguin.className = "PenguinIEAnimateOffScreen";
};

Characters.prototype.StartIEPenguinSinging = function () {
    this.iePenguinBeak.className = "PenguinIESinging";
};

Characters.prototype.StopIEPenguinSinging = function () {
    this.iePenguinBeak.className = "PenguinIESilent";
};


// Opera Animations

Characters.prototype.ShowOperaPenguin = function () {
    this.operaPenguin.className = "PenguinOperaAnimateOnScreen";
};

Characters.prototype.HideOperaPenguin = function () {
    this.operaPenguin.className = "PenguinOperaAnimateOffScreen";
};

Characters.prototype.StartOperaPenguinSinging = function () {
    this.operaPenguinBeak.className = "PenguinOperaSinging";
};

Characters.prototype.StopOperaPenguinSinging = function () {
    this.operaPenguinBeak.className = "PenguinOperaSilent";
};


// Firefox Animations

Characters.prototype.ShowFirefoxPenguin = function () {
    this.firefoxPenguin.className = "PenguinFirefoxAnimateOnScreen";
};

Characters.prototype.HideFirefoxPenguin = function () {
    this.firefoxPenguin.className = "PenguinFirefoxAnimateOffScreen";
};

Characters.prototype.StartFirefoxPenguinSinging = function () {
    this.firefoxPenguinBeak.className = "PenguinFirefoxSinging";
};

Characters.prototype.StopFirefoxPenguinSinging = function () {
    this.firefoxPenguinBeak.className = "PenguinFirefoxSilent";
};


// Safari Animations

Characters.prototype.ShowSafariPenguin = function () {
    this.safariPenguin.className = "PenguinSafariAnimateOnScreen";
};

Characters.prototype.HideSafariPenguin = function () {
    this.safariPenguin.className = "PenguinSafariAnimateOffScreen";
};

Characters.prototype.StartSafariPenguinSinging = function () {
    this.safariPenguinBeak.className = "PenguinSafariSinging";
};

Characters.prototype.StopSafariPenguinSinging = function () {
    this.safariPenguinBeak.className = "PenguinSafariSilent";
};


// Chrome Animations

Characters.prototype.ShowChromePenguin = function () {
    this.chromePenguin.className = "PenguinChromeAnimateOnScreen";
};

Characters.prototype.HideChromePenguin = function () {
    this.chromePenguin.className = "PenguinChromeAnimateOffScreen";
};

Characters.prototype.StartChromePenguinSinging = function () {
    this.chromePenguinBeak.className = "PenguinChromeSinging";
};

Characters.prototype.StopChromePenguinSinging = function () {
    this.chromePenguinBeak.className = "PenguinChromeSilent";
};


Characters.prototype.ShowAllCharacters = function () {
    document.getElementById("WelcomeScreen").style.visibility = "hidden";
    document.getElementById("ResultsScreen").style.visibility = "hidden";
    this.chromePenguin.style.visibility = "visible";
    this.firefoxPenguin.style.visibility = "visible";
    this.iePenguin.style.visibility = "visible";
    this.operaPenguin.style.visibility = "visible";
    this.safariPenguin.style.visibility = "visible";
    this.ShowIEPenguin();
    this.ShowOperaPenguin();
    this.ShowFirefoxPenguin();
    this.ShowSafariPenguin();
    this.ShowChromePenguin();
};


Characters.prototype.HideAllCharacters = function () {
    document.getElementById("WelcomeScreen").style.visibility = "hidden";
    document.getElementById("ResultsScreen").style.visibility = "hidden";
    this.HideIEPenguin();
    this.HideOperaPenguin();
    this.HideFirefoxPenguin();
    this.HideSafariPenguin();
    this.HideChromePenguin();
};


Characters.prototype.ToggleBorders = function () {

    if (this.bordersVisible) {
        this.bordersVisible = false;
        document.getElementById("PenguinContainer").style.border = "0px";
        document.getElementById("PenguinOperaContainer").style.border = "0px";
        document.getElementById("PenguinFirefoxContainer").style.border = "0px";
        document.getElementById("PenguinSafariContainer").style.border = "0px";
        document.getElementById("PenguinChromeContainer").style.border = "0px";
        document.getElementById("PenguinIEContainer").style.border = "0px";
        document.getElementById("PenguinOpera").style.border = "0px";
        document.getElementById("PenguinFirefox").style.border = "0px";
        document.getElementById("PenguinSafari").style.border = "0px";
        document.getElementById("PenguinChrome").style.border = "0px";
        document.getElementById("PenguinIE").style.border = "0px";
        document.getElementById("PenguinOperaBeakLower").style.border = "0px";
        document.getElementById("PenguinFirefoxBeakLower").style.border = "0px";
        document.getElementById("PenguinSafariBeakLower").style.border = "0px";
        document.getElementById("PenguinChromeBeakLower").style.border = "0px";
        document.getElementById("PenguinIEBeakLower").style.border = "0px";
        document.getElementById("PenguinOperaBeakUpper").style.border = "0px";
        document.getElementById("PenguinFirefoxBeakUpper").style.border = "0px";
        document.getElementById("PenguinSafariBeakUpper").style.border = "0px";
        document.getElementById("PenguinChromeBeakUpper").style.border = "0px";
        document.getElementById("PenguinIEBeakUpper").style.border = "0px";
    }
    else {
        this.bordersVisible = true;
        document.getElementById("PenguinContainer").style.border = "8px solid red";
        document.getElementById("PenguinOperaContainer").style.border = "2px solid blue";
        document.getElementById("PenguinFirefoxContainer").style.border = "2px solid blue";
        document.getElementById("PenguinSafariContainer").style.border = "2px solid blue";
        document.getElementById("PenguinChromeContainer").style.border = "2px solid blue";
        document.getElementById("PenguinIEContainer").style.border = "2px solid blue";
        document.getElementById("PenguinOpera").style.border = "2px solid yellow";
        document.getElementById("PenguinFirefox").style.border = "2px solid yellow";
        document.getElementById("PenguinSafari").style.border = "2px solid yellow";
        document.getElementById("PenguinChrome").style.border = "2px solid yellow";
        document.getElementById("PenguinIE").style.border = "2px solid yellow";
        document.getElementById("PenguinOperaBeakLower").style.border = "2px solid green";
        document.getElementById("PenguinFirefoxBeakLower").style.border = "2px solid green";
        document.getElementById("PenguinSafariBeakLower").style.border = "2px solid green";
        document.getElementById("PenguinChromeBeakLower").style.border = "2px solid green";
        document.getElementById("PenguinIEBeakLower").style.border = "2px solid green";
        document.getElementById("PenguinOperaBeakUpper").style.border = "2px solid fuchsia";
        document.getElementById("PenguinFirefoxBeakUpper").style.border = "2px solid fuchsia";
        document.getElementById("PenguinSafariBeakUpper").style.border = "2px solid fuchsia";
        document.getElementById("PenguinChromeBeakUpper").style.border = "2px solid fuchsia";
        document.getElementById("PenguinIEBeakUpper").style.border = "2px solid fuchsia";
    }

};