/* global Pcx */
(function () {
	'use strict';

	var toHexDigit = function (x) {
		if (x < 10) {
			return x;
		}
		return String.fromCharCode('A'.charCodeAt(0) + x - 10);
	};

	var intToHexString = function (i, digits) {
		var hexStr = '';
		while (i > 0) {
			hexStr = toHexDigit(i & 0xF) + hexStr;
			i = i >> 4;
		}
		var paddingLength = digits - hexStr.length;
		for (var x = 0; x < paddingLength; x++) {
			hexStr = '0' + hexStr;
		}
		return hexStr;
	};

	var charForInt = function (i) {
		if (i < 32 || i >= 0x7F) {
			return '.';
		}
		return String.fromCharCode(i);
	};

	var CHUNK_SIZE = 512;

	var currentBuffer, startAt;

	// Check that browser supports necessary functionality
	var checkCompat = function () {
		// * DataView (has fallback no-exist handling)

		// Feature-detect significant dependencies...
		// Assume compatible by default
		var compatible = true;
		if (!window.HTMLCanvasElement || !window.Uint8Array ||
			!window.FileReader || !(window.URL || window.webkitURL) ||
			!(window.Blob || window.WebKitBlobBuilder) ||
			!window.HTMLVideoElement || !window.HTMLSourceElement) {
			compatible = false;
		}

		var intro = document.getElementById('intro-wrapper');
		var warn = document.getElementById('support-warning');
		if (!compatible) {
			intro.style.display = 'none';
			warn.style.display = 'block';
		} else {
			intro.style.display = 'block';
			warn.style.display = 'none';
		}
		return compatible;
	};

	// Display Hex representation of current chunk of data
	var renderHexChunk = function (str) {
		var container = document.getElementById('hex-grid');
		container.innerHTML = '';
		var elem = document.createElement('pre');
		container.appendChild(elem);
		elem.appendChild(document.createTextNode(str));
	};

	var setNextState = function (enabled) {
		var buttonNext = document.getElementById('next');
		if (enabled) {
			buttonNext.className = 'my-button';
		} else {
			buttonNext.className = 'my-button-grey';
		}
	};

	var setPrevState = function (enabled) {
		var buttonPrev = document.getElementById('prev');
		if (enabled) {
			buttonPrev.className = 'my-button';
		} else {
			buttonPrev.className = 'my-button-grey';
		}
	};

	var syncButtonState = function () {
		if (!currentBuffer || startAt + CHUNK_SIZE >= currentBuffer.byteLength) {
			setNextState(false);
		} else {
			setNextState(true);
		}
		if (!currentBuffer || startAt - CHUNK_SIZE < 0) {
			setPrevState(false);
		} else {
			setPrevState(true);
		}
	};

	// Convert a chunk of binary data from buffer with given offset to Hex string
	var getHexChunk = function (buffer, startAt) {
		var chunkLength = Math.min(CHUNK_SIZE, buffer.byteLength - startAt);
		var uints = new Uint8Array(buffer, startAt, chunkLength);
		var rowString = '';
		for (var row = 0; row < uints.length; row += 16) {
			var remaining = uints.length - row;
			rowString += intToHexString(row + startAt, 8);
			rowString += '  ';
			for (var offset = 0; offset < 8; offset++) {
				if (offset < remaining) {
					rowString += intToHexString(uints[row + offset], 2) + ' ';
				}
				else {
					rowString += '   ';
				}
			}
			rowString += ' ';
			for (; offset < 16; offset++) {
				if (offset < remaining) {
					rowString += intToHexString(uints[row + offset], 2) + ' ';
				}
				else {
					rowString += '   ';
				}
			}
			rowString += '  ';
			for (offset = 0; offset < 8; offset++) {
				rowString += charForInt(uints[row + offset]);
			}
			for (; offset < 16; offset++) {
				rowString += charForInt(uints[row + offset]);
			}
			rowString += '\n';
		}
		return rowString;
	};

	// Handle 'Next' button click
	var clickNext = function () {
		if (!currentBuffer || startAt + CHUNK_SIZE >= currentBuffer.byteLength) {
			syncButtonState();
			return;
		}
		startAt += CHUNK_SIZE;
		var str = getHexChunk(currentBuffer, startAt);
		syncButtonState();
		renderHexChunk(str);
	};

	// Handle 'Prev' button click
	var clickPrev = function () {
		if (!currentBuffer || startAt - CHUNK_SIZE < 0) {
			syncButtonState();
			return;
		}
		startAt -= CHUNK_SIZE;
		var str = getHexChunk(currentBuffer, startAt);
		syncButtonState();
		renderHexChunk(str);
	};

	// Renders the hex contents of the buffer into
	var renderFile = function (buffer) {
		/// <param name='buffer' type='ArrayBuffer'/>
		currentBuffer = buffer;
		startAt = 0;
		var str = getHexChunk(buffer, startAt);
		renderHexChunk(str);
	};

	// Read the contents of the File object into an ArrayBuffer
	// then call 'successCallback'.
	var readFileToArrayBuffer = function (file, successCallback) {
		var reader = new FileReader();
		reader.onload = function () {
			var buffer = reader.result;
			successCallback(buffer);
			syncButtonState();
		};
		reader.onerror = function (evt) {
			if (evt.target.error.code === evt.target.error.NOT_READABLE_ERR) {
				throw new Error('Failed to read file: ' + file.name);
			}
		};
		try {
			reader.readAsArrayBuffer(file);
		} catch (e) {
			//silently fail
		}
	};

	var previewImage = function (blob, elem) {
		if (blob.type.indexOf('image/jpeg') !== -1 || blob.type.indexOf('image/png') !== -1 || blob.type.indexOf('image/gif') !== -1) {
			var URL = window.URL || window.webkitURL;
			var img = document.createElement('img');
			img.src = URL.createObjectURL(blob);
			img.width = 600;
			elem.appendChild(img);
			return true;
		} else {
			return false;
		}
	};

	var previewAudio = function (blob, elem) {
		if (blob.type.indexOf('audio/mpeg') !== -1 || blob.type.indexOf('audio/mp3') !== -1) {
			var URL = window.URL || window.webkitURL;
			var div = document.createElement('div');
			div.id = 'placeholder';
			var div2 = document.createElement('div');
			div2.className = 'textIcon';
			div2.innerHTML = blob.type ? '<b>Mime type:</b> ' + blob.type : 'No preview';
			div.appendChild(div2);
			elem.appendChild(div);
			// Add audio
			var audio = document.createElement('audio');
			elem.appendChild(audio);
			audio.src = URL.createObjectURL(blob);
			audio.play();
			return true;
		} else {
			return false;
		}
	};

	var previewVideo = function (blob, elem) {
		if (blob.type.indexOf('video/mpeg') !== -1 || blob.type.indexOf('video/mp4') !== -1) {
			var URL = window.URL || window.webkitURL;
			var video = document.createElement('video');
			elem.appendChild(video);
			var src = document.createElement('source');
			src.src = URL.createObjectURL(blob);
			video.appendChild(src);
			video.play();
			return true;
		} else {
			return false;
		}
	};

	var previewPcx = function (blob, elem) {
		if (blob.type.indexOf('x-pcx') !== -1) {
			var div = document.createElement('div');
			div.id = 'placeholder';
			if (!window.DataView) {
				var div2 = document.createElement('div');
				div2.className = 'textIcon';
				div2.innerHTML = '<span style="color: red">Your browser doesn\'t support DataView</span>';
				div.appendChild(div2);
			}
			elem.appendChild(div);
			var reader = new FileReader();
			reader.onload = function () {
				var arrayBuffer = reader.result;
				var buffer = new Uint8Array(arrayBuffer);
				var pcx = new Pcx();
				pcx.load(buffer);

				var canvas = document.createElement('canvas');
				canvas.width = pcx.xSize;
				canvas.height = pcx.ySize;
				pcx.drawToCanvas(canvas);

				var sizedCanvas = document.createElement('canvas');
				var ratio = 300 / pcx.xSize;
				ratio = Math.min(ratio, 500 / pcx.ySize);
				var width = (ratio < 1) ? Math.round(pcx.xSize * ratio) : pcx.xSize;
				var height = (ratio < 1) ? Math.round(pcx.ySize * ratio) : pcx.ySize;
				sizedCanvas.width = width;
				sizedCanvas.height = height;
				var sizedContext = sizedCanvas.getContext('2d');
				sizedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
				div.style.width = width + 'px';
				div.style.height = height + 'px';
				div.style.padding = '0px';
				div.appendChild(sizedCanvas);
			};
			reader.readAsArrayBuffer(blob);
			return true;
		} else {
			return false;
		}
	};

	var previewDefault = function (blob, elem) {
		var div = document.createElement('div');
		div.id = 'placeholder';
		var div2 = document.createElement('div');
		div2.className = 'textIcon';
		div2.innerHTML = blob.type ? '<b>Mime type:</b> ' + blob.type : 'No preview';
		div.appendChild(div2);
		elem.appendChild(div);
		return true;
	};

	var previews = [previewImage, previewAudio, previewVideo, previewPcx, previewDefault];

	// Display preview
	var displayBlob = function (blob) {
		var elem = document.getElementById('blob-display');
		elem.innerHTML = '';

		for (var i = 0, l = previews.length; i < l; i++) {
			if (previews[i](blob, elem)) {
				break;
			}
		}
	};

	// Display file details and preview (if supported for this type)
	var fileSelected = function (file, name) {
		readFileToArrayBuffer(file, renderFile);
		displayBlob(file, name);
		document.getElementById('fileName').innerText = (file.name) ? file.name : name;
		document.getElementById('mimeType').innerHTML = file.type;
		document.getElementById('fileSize').innerHTML = file.size;
		if (file.lastModifiedDate) {
			var d = new Date(file.lastModifiedDate);
			document.getElementById('lastModified').innerHTML = d.toDateString();
		} else {
			var lastMod = document.getElementById('lastModifiedItem');
			lastMod.style.display = 'none';
		}
	};

	var clearFileInput = function () {
		var oldInput = document.getElementById('fileInput');
		var newInput = document.createElement('input');

		newInput.type = 'file';
		newInput.id = oldInput.id;
		newInput.name = oldInput.name;
		newInput.onchange = oldInput.onchange;

		oldInput.parentNode.replaceChild(newInput, oldInput);
	};

	// Grabs the selected File object and :
	// 1) read into an ArrayBuffer
	// 2) attempt to display the blob contents
	var localfileSelected = function () {
		// Update UI
		var details = document.getElementById('detailedView');
		details.style.display = 'block';
		var lastMod = document.getElementById('lastModifiedItem');
		lastMod.style.display = 'block';
		var serverFiles = document.getElementById('serverFiles');
		serverFiles.selectedIndex = 0;
		// Get file
		var fileInput = document.getElementsByName('fileInput')[0];
		if (fileInput && fileInput.files && fileInput.files[0]) {
			fileSelected(fileInput.files[0], fileInput.files[0].name);
		} else {
			throw new Error('Please select another file');
		}
	};

	// Handle drop-down control selection for server stored files
	var serverfileSelected = function () {
		clearFileInput();
		// Update UI
		var details = document.getElementById('detailedView');
		details.style.display = 'block';
		// Last modified is not available for server files
		var lastMod = document.getElementById('lastModifiedItem');
		lastMod.style.display = 'none';

		// Get file
		var serverFiles = document.getElementById('serverFiles');
		var values = serverFiles.options[serverFiles.selectedIndex].value.split(',');
		var selectedFile = values[0];
		if (selectedFile !== '') {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function () {
				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200 && xhr.response) {
						fileSelected(xhr.response, selectedFile);
					} else {
						throw new Error('Failed to download:' + xhr.status + ' ' + xhr.statusText);
					}
				}
			};
			xhr.open('GET', selectedFile, true);
			xhr.responseType = 'blob';
			xhr.send();
		}
	};

	document.getElementById('serverFiles').addEventListener('change', serverfileSelected, false);
	document.getElementById('fileInput').onchange = localfileSelected;
	document.getElementById('prev').addEventListener('click', clickPrev, false);
	document.getElementById('next').addEventListener('click', clickNext, false);

	(function initPage () {
		if (checkCompat()) {
			var select = document.getElementById('serverFiles');
			select.value = 'data/iStock_000009426004XSmall2.pcx,application/octet-stream';
			serverfileSelected();
		}
	}());
}());
