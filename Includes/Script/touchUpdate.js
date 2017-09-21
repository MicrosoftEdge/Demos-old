(function () {
	function touchCallBack(e) {
		if(styleSet) return;
		// check to see if the user is using a mouse
		if(e.pointerId != 1) {
			setStyle();
		}
	}
	function updateStyle(CSSSelector, newStyle) {
		if (!newStyle || !CSSSelector) return;
		var rules;
		for (i in document.styleSheets) {
			try {
				rules = document.styleSheets[i].cssRules;
			} catch (err) {
				continue;
			}
			for (n in rules) {
				if (rules[n].selectorText == CSSSelector) {
					for (newStyleName in newStyle) {
						eval("rules[n].style."+newStyleName+"='" + newStyle[newStyleName] + "';");
					}
				}
			}
		}
	}
	function setStyle() {
		// construct the style object
		for (tmpClass in CSSClasses) {
			var newStyle = {};
			var tok = newStyles[tmpClass].split(', ');
			if(!tok) continue;
			for(tmpTok in tok) {
				var splitTok = tok[tmpTok].split(':');
				eval("newStyle." + splitTok[0].replace(/'/gi,"") + "=" + splitTok[1] + ";");
			}
			updateStyle(CSSClasses[tmpClass], newStyle);
		}
		// set the global varilables that have been requested for
		if(varNames && varValues){
			for(variable in varNames){
				eval("window." + varNames[variable] + "=" + varValues[variable]);
			}
		}

		// disable selection at document level
		if(disableSelection) {
			document.onselectstart=function(){return false}
		}

		// call any functions that we need to call
		if(callFunctions) {
			for(func in window.touchCallBackFuncs) {
				window.touchCallBackFuncs[func]();
			}
		}
		// disable drag
		document.ondragstart=function() {return false};
		styleSet = true;
		document.removeEventListener("MSPointerDown", touchCallBack, false);
		document.removeEventListener("MSPointerMove", touchCallBack, false);
	}
	var scriptTag;
	var CSSClasses = {};
	var newStyles = {};
	var styleSet = false;
	var varNames;
	var varValues;
	var disableSelection = false;
	var callFunctions = false;
	// do any of this only when required
	if(window.navigator.msPointerEnabled) {
		//parse and construct the required data
		var scriptTags = document.getElementsByTagName("script");
        if(!scriptTags) return;
        for(i in scriptTags) {
            if(scriptTags[i].getAttribute("CSSSelector") !== null) {
                scriptTag = scriptTags[i];
                break;
            }
        }
		if(typeof scriptTag !== 'undefined') {
			CSSClasses=scriptTag.getAttribute("CSSSelector").split(";");
			newStyles=scriptTag.getAttribute("Styles").split(";");
			if(scriptTag.hasAttribute("variableName")) varNames=scriptTag.getAttribute("variableName").split(";");
			if(scriptTag.hasAttribute("variableValue")) varValues=scriptTag.getAttribute("variableValue").split(";");
			if(scriptTag.hasAttribute("disableSelection")) disableSelection = true;
			if(scriptTag.hasAttribute("callFunctions")) callFunctions = true;
		}
		document.addEventListener("MSPointerDown", touchCallBack, false);
		document.addEventListener("MSPointerMove", touchCallBack, false);
	}

} ());
