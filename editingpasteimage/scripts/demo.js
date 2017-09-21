(function () {
	'use strict';
	var currentPasteType = 'no script';
	var imagesBeforePaste = 0;
	var DEFAULT_PASTE_TIMEOUT = 0;
	var DEFAULT_HIGHLIGHT_TIME = 4000;
	var defaultMessageSet = false;
	var nondefaultMessageSet = false;
	var editDocument;
	var editBody;

	var showUpgradeNotice = function (text) {
		var dialog = document.getElementById('upgrade');
		var textElement = document.getElementById('upgrade-text');
		if (dialog) {
			if (text) {
				textElement.textContent = text;
			}
			dialog.style.display = 'block';
		}
	};

	var hideUpgradeNotice = function () {
		var dialog = document.getElementById('upgrade');
		if (dialog) {
			dialog.style.display = 'none';
		}
	};

	var checkUA = function () {
		var result = true;
		if (navigator.userAgent.toLowerCase().indexOf('mobile') !== -1 &&
			navigator.userAgent.toLowerCase().indexOf('ipad') === -1) { // iPad uses 'Mobile' in it's UA String, unlike other tablets
			showUpgradeNotice('This demo is not designed for mobile.');
			result = false;
		} else if (document.documentMode && document.documentMode < 11) {
			showUpgradeNotice();
			result = false;
		}
		return result;
	};

	var setPasteType = function (type) {
		while (editBody.childNodes.length > 0) {
			editBody.removeChild(editBody.childNodes[0]);
		}
		currentPasteType = type;
	};

	var updateMarkup = function () {
		var mC = document.getElementById('markup-container');
		mC.value = editBody.innerHTML;
	};

	var highlightInstructions = function () {
		var ins = document.getElementById('primary-instructions');
		ins.style.backgroundColor = 'red';
		ins.style.color = 'white';
		setTimeout(function () {
			ins.style.backgroundColor = '';
			ins.style.color = '';
		}, DEFAULT_HIGHLIGHT_TIME);
	};

	var isFileScheme = function (images) {
		var result = false;
		for (var i = 0; i < images.length; i++) {
			result = result || images[i].src.toLowerCase().indexOf('file://') !== -1;
		}
		return result;
	};

	var setMessageForNonDefault = function (state) {
		updateMarkup();
		if (!nondefaultMessageSet) {
			var mC = document.getElementById('message-container-nondefault');
			var images = editDocument.querySelectorAll('img');
			var fileSchemeDetected = isFileScheme(images);
			if (fileSchemeDetected) {
				mC.innerHTML = 'With script running, your browser didn\'t convert all of the local images :(';
				mC.style.color = 'red';
				nondefaultMessageSet = true;
			} else if (state === 'success') {
				var blobExists = false;
				for (var i = 0; i < images.length; i++) {
					if (images[i].src.indexOf('blob:') !== -1) {
						mC.innerHTML = 'Your browser supports script to determine the type of paste to run :)';
						mC.style.color = 'green';
						blobExists = true;
						nondefaultMessageSet = true;
						break;
					}
				}
				if (!blobExists) {
					mC.innerHTML = 'Your browser may not support this type of paste. Did you copy a local image? :(';
					mC.style.color = 'red';
					nondefaultMessageSet = true;
				}
			} else if (state === 'no image') {
				mC.innerHTML = 'Your browser may not support this type of paste. Did you copy a local image? :(';
				highlightInstructions();
				mC.style.color = 'red';
			} else { // 'failure'
				mC.innerHTML = 'Your browser doesn\'t support script to determine the type of paste to run :(';
				mC.style.color = 'red';
				nondefaultMessageSet = true;
			}
		}
	};

	var setMessageForDefault = function () {
		updateMarkup();
		if (!defaultMessageSet) {
			var mC = document.getElementById('message-container-default');
			var images = editDocument.querySelectorAll('img');
			var fileSchemeDetected = isFileScheme(images);
			var dataUriExists = false;
			if (fileSchemeDetected) {
				mC.innerHTML = 'Your browser didn\'t convert all of the local images by default :(';
				mC.style.color = 'red';
				defaultMessageSet = true;
			} else if (imagesBeforePaste < images.length) {
				for (var i = 0; i < images.length; i++) {
					if (images[i].src.indexOf('data:') !== -1) {
						mC.innerHTML = 'Your browser supports pasting images without script :)';
						mC.style.color = 'green';
						dataUriExists = true;
						defaultMessageSet = true;
						break;
					}
				}
				if (!dataUriExists) {
					mC.innerHTML = 'If you used a local image as indicated above, your browser may not support this copy source :(';
					mC.style.color = 'red';
					highlightInstructions();
				}
			} else {
				mC.innerHTML = 'Without script, no image was pasted. Did you copy a local image? :(';
				highlightInstructions();
				mC.style.color = 'red';
			}
		}
	};

	var handlePaste = function (evt) {
		var cbData;
		if (evt.clipboardData) {
			cbData = evt.clipboardData;
		} else if (window.clipboardData) {
			cbData = window.clipboardData;
		}
		switch (currentPasteType) {
		case 'no script':
			imagesBeforePaste = editDocument.querySelectorAll('img').length;
			setTimeout(setMessageForDefault, DEFAULT_PASTE_TIMEOUT);
			// do nothing in paste handler, so browser does whatever is default
			break;
		case 'blob':
			if (evt.msConvertURL) {
				var fileList = cbData.files;
				if (fileList.length > 0) {
					for (var i = 0; i < fileList.length; i++) {
						var file = fileList[i];
						var url = URL.createObjectURL(file);
						evt.msConvertURL(file, 'specified', url);
					}
					setTimeout(function () {
						setMessageForNonDefault('success');
					}, DEFAULT_PASTE_TIMEOUT);
				} else {
					setTimeout(function () {
						setMessageForNonDefault('no image');
					}, DEFAULT_PASTE_TIMEOUT);
				}
			} else if (cbData.items) {
				var itemList = cbData.items;
				if (itemList.length > 0) {
					var foundImage = false;
					for (var i = 0; i < itemList.length; i++) {
						if (itemList[i].type.indexOf('image') !== -1) {
							var file = itemList[i].getAsFile();
							var url = URL.createObjectURL(file);
							editBody.innerHTML += '<img src=\'' + url + '\' >';
							foundImage = true;
							break;
						}
					}
					if (foundImage) {
						evt.preventDefault();
						setTimeout(function () {
							setMessageForNonDefault('success');
						}, DEFAULT_PASTE_TIMEOUT);
					} else {
						setTimeout(function () {
							setMessageForNonDefault('no image');
						}, DEFAULT_PASTE_TIMEOUT);
					}
				} else {
					setTimeout(function () {
						setMessageForNonDefault('no image');
					}, DEFAULT_PASTE_TIMEOUT);
				}
			} else {
				setTimeout(function () {
					setMessageForNonDefault('failure');
				}, DEFAULT_PASTE_TIMEOUT);
				evt.preventDefault();
				return false;
			}
			break;
		default:
		}
		setTimeout(updateMarkup, DEFAULT_PASTE_TIMEOUT);
	};

	var showMarkup = function (show) {
		var markupSection = document.getElementById('markup-section');
		var hideMarkupButton = document.getElementById('hide-markup-button');
		if (show) {
			updateMarkup();
			markupSection.style.display = 'block';
			hideMarkupButton.textContent = 'hide pasted mark-up';
			window.scrollTo(0, 1000);
		} else {
			markupSection.style.display = 'none';
			hideMarkupButton.textContent = 'show pasted mark-up';
		}
	};

	var toggleShowMarkup = function () {
		var state = (document.getElementById('markup-section').style.display === 'none');
		showMarkup(state);
	};

	var setupSlider = function () {
		var toggle = document.getElementById('paste-type');
		toggle.value = 0;

		var setState = function (evt) {
			if (evt.target.value === '0') {
				setPasteType('no script');
				toggle.title = '\'no script\' selected. Move slider to switch to \'blob script\'';
				defaultMessageSet = false;
				nondefaultMessageSet = false;
				editBody.focus();
			} else {
				setPasteType('blob');
				toggle.title = '\'blob script\' selected. Move slider to switch to no script';
				defaultMessageSet = false;
				nondefaultMessageSet = false;
				editBody.focus();
			}
		};
		toggle.addEventListener('change', setState);
		toggle.addEventListener('input', setState);
	};

	var setupPasteButton = function () {
		var btn = document.getElementById('paste-button');
		if (!editDocument.queryCommandSupported('paste') && !btn.setup) {
			btn.parentElement.removeChild(btn);
			document.getElementById('paste-button-container').textContent = 'Paste command not supported by browser. Please use control-v.';
		}
		btn.setup = true;
	};

	var execPaste = function () {
		editBody.focus();
		try {
			editDocument.execCommand('paste');
		} catch (ex) {
			var btn = document.getElementById('paste-button');
			btn.parentElement.removeChild(btn);
			document.getElementById('paste-button-container').textContent = 'Paste command disabled by browser settings. Please use control-v.';
		}
	};

	var setup = function () {
		if (checkUA()) {
			hideUpgradeNotice();
			currentPasteType = 'no script';
			editDocument = document.getElementById('edit-frame').contentDocument;
			editBody = editDocument.body;
			editBody.addEventListener('paste', handlePaste);
			setupSlider();
			setupPasteButton();
			editBody.focus();
			defaultMessageSet = false;
			nondefaultMessageSet = false;
		}
	};

	document.addEventListener('DOMContentLoaded', function () {
		document.querySelector('#show-markup').addEventListener('click', function () {
			showMarkup(true);
			window.scrollTo(0, 1000);
		});
		document.querySelector('#paste-button').addEventListener('click', function () {
			execPaste();
		});
		document.querySelector('#edit-frame').addEventListener('load', function () {
			setup();
		});
		document.querySelector('#edit-frame').addEventListener('keyup', function () {
			updateMarkup();
		});
		document.querySelector('#hide-markup-button').addEventListener('click', function () {
			toggleShowMarkup();
		});
		document.querySelector('#dismiss-button').addEventListener('click', function () {
			hideUpgradeNotice();
		});
	});
}());
