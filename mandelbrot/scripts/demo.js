(function () {
	'use strict';

	var RE_MIN = -2.5;
	var IM_MAX = 1.2;
	var IM_MIN = -1.2;
	var MAX_ITERATIONS = 1200; // Increase this value to improve detection of complex c values that belong to the Mandelbrot set.
	var STATIC_ZOOM_BOX_FACTOR = 0.25; // Increase to make the double-click and hold gesture zoom box bigger.
	var DEFAULT_MESSAGE = 'Click or click-and-drag to zoom.';
	var CALCULATING_MESSAGE = 'Calculating...'; // Automatically prints an animated (indeterminate) status bar to the screen.

	var globals = {}; // See the handleLoad function.

	var interestingRegions = {
		blackSpiral: {
			title: 'Black Spiral',
			url: '-0.52729315207746,-0.5272931522100369,0.614348706587367,0.6143487064989823,7.386152712308387'
		},
		blatweasel: {
			title: 'Blatweasel',
			url: '-0.744621930539234,-0.7446245661922831,0.18393268471477686,0.18393092761274407,1.663199690617636'
		},
		boomerang: {
			title: 'Boomerang',
			url: '-1.2523512249332716,-1.2523512249874715,0.32672369610834323,0.3267236960696291,1.7663479865761256'
		},
		cyclopes: {
			title: 'Cyclops',
			url: '-0.555687221572448,-0.5556872246537563,0.6240879858397925,0.6240879837855869,2.859654584557026'
		},
		diamondFur: {
			title: 'Diamond Fur',
			url: '-0.41576542525,-0.41614258555,0.600839301,0.6005878607999999,1.5376964311902315'
		},
		featherBall: {
			title: 'Feather Ball',
			url: '-0.6315768161591643,-0.631578822244027,0.45138245824020146,0.45138102532244234,2.6617751002784242'
		},
		fernCurl: {
			title: 'Fern Curl',
			url: '0.3282906322812501,0.3281654466546876,0.057411106673437344,0.05732764958906234,1.6433016951211265'
		},
		fourStar: {
			title: 'Four Star',
			url: '0.27806544489867035,0.2780653929146151,0.007916358494575261,0.007916323838538382,1.4156299729037484'
		},
		galacticSpin: {
			title: 'Galactic Spin',
			url: '-0.06346901196786074,-0.06346979614198687,0.6655241694777434,0.6655236466949926,2.400906646022077'
		},
		lace: {
			title: 'Lace',
			url: '-0.7799780876686571,-0.7825424124999998,-0.14601189440145495,-0.14772144428901676,1'
		},
		mandelSwirl: {
			title: 'Mandel Swirl',
			url: '-0.37520009125,-0.37533587593749995,0.6048221915625001,0.6047316684375,1'
		},
		northStar: {
			title: 'North Star',
			url: '0.3614756295000028,0.36147552505938907,0.6026588929672347,0.602658823340159,1.7110838709947804'
		},
		roundSquare: {
			title: 'Round Square',
			url: '-0.5939006266304272,-0.593900626630516,0.4418421067485839,0.44184210674852464,1'
		},
		sparkler: {
			title: 'Sparkler',
			url: '-0.32715253281753387,-0.3359055939430091,0.6220290872995163,0.6161937132158662,1'
		},
		spiderweb: {
			title: 'Spiderweb',
			url: '-0.7457372139895254,-0.7470195902099428,0.18474881872511895,0.18389390124484067,1.0801238415473706'
		},
		starCluster: {
			title: 'Star Cluster',
			url: '-0.6223641672502016,-0.6223641672800205,0.6098359116743463,0.6098359116544669,1.3668092132466447'
		},
		straightAndNarrow: {
			title: 'Straight and Narrow',
			url: '-0.9765377671545512,-0.9765377679584662,-0.3071578902852653,-0.3071578908212087,1.4486460981134734'
		},
		hairDiamond: {
			title: 'Hair Diamond',
			url: '-0.48287184747713563,-0.48287259088795326,0.6261909767979006,0.6261904457901737,1.9526995205781752'
		},
		swirlyBob: {
			title: 'Swirly Bob',
			url: '-0.7662004000000001,-0.7671643,-0.09401295000000008,-0.09465555000000009,1.208982382779602'
		},
		twiggy: {
			title: 'Twiggy',
			url: '-0.08870814476657499,-0.08870839409064998,0.96258758869815,0.9625874224820999,1.4898224297544738'
		}
	};

	var formatNumber = function (number) {
		// Formats numbers so that it has commas in the expected places.
		var numberString = Math.round(number).toString(); // An integer value is assumed, so we ensure that it is indeed an integer.
		var precompiledRegularExpression = /(\d+)(\d{3})/;

		while (precompiledRegularExpression.test(numberString)) {
			numberString = numberString.replace(precompiledRegularExpression, '$1' + ',' + '$2'); // For this integer, inject ',''s at the appropriate locations.
		} // while

		return numberString;
	};

	var loadRegions = function () {
		var interesting = interestingRegions;
		var regions = document.getElementById('regions');
		var regionsList = document.getElementById('regions__list');
		var list = document.createDocumentFragment();
		var presets = document.getElementById('presets-button');

		for (var i in interesting) {
			var item = document.createElement('button');
			var itemText;

			item.className = 'button regions__button';

			itemText = document.createElement('span');
			itemText.className = 'regionText';
			itemText.textContent = interesting[i].title;

			item.appendChild(itemText);

			item.setAttribute('data-url', interesting[i].url);
			item.addEventListener('click', function (e) {
				window.location = '#' + e.currentTarget.getAttribute('data-url');
				regions.classList.remove('regions--active');
			}, false);
			list.appendChild(item);
		}
		regionsList.appendChild(list);

		presets.addEventListener('click', function () {
			var canvas = document.getElementById('mandelbrot-canvas');
			regions.classList.add('regions--active');
		}, false);
	};

	var initializeWebWorkers = function (webWorkerJsPath) {
		if (globals.coarseDetailWorker) {
			globals.coarseDetailWorker.terminate();
		}

		if (globals.fineDetailWorker) {
			globals.fineDetailWorker.terminate();
		}

		globals.coarseDetailWorker = new Worker(webWorkerJsPath);
		globals.fineDetailWorker = new Worker(webWorkerJsPath);
	};

	var getHashValues = function () {
		var dirtyComplexPlaneExtremaString = (window.location.hash).replace('#', ''); // Remove the leading '#' character from the string.
		var complexPlaneExtremaString = dirtyComplexPlaneExtremaString.split(','); // Returns an array. Assumes the following string form: 'ReMax,ReMin,ImMax,ImMin,grayscaleFactor' (note that if grayscaleFactor is 1, the image's grayscale is not affected).

		var ReMax = parseFloat(complexPlaneExtremaString[0]);
		var ReMin = parseFloat(complexPlaneExtremaString[1]);
		var ImMax = parseFloat(complexPlaneExtremaString[2]);
		var ImMin = parseFloat(complexPlaneExtremaString[3]);
		var grayscaleFactor = parseFloat(complexPlaneExtremaString[4]);

		if (isNaN(ReMax) || isNaN(ReMin) || isNaN(ImMax) || isNaN(ImMin) || isNaN(grayscaleFactor)) {
			return null;
		}

		return {
			ReMax: ReMax,
			ReMin: ReMin,
			ImMax: ImMax,
			ImMin: ImMin,
			grayscaleFactor: grayscaleFactor
		};
	};

	var xToRe = function (x) {
		var xCoefficient = (globals.ReMax - globals.ReMin) / globals.canvas.width;
		return (x * xCoefficient) + globals.ReMin; // Converts a canvas x-coordinate value to the associated complex plane Re-coordinate.
	};

	var yToIm = function (y) {
		var yCoefficient = (globals.ImMin - globals.ImMax) / globals.canvas.height;
		return (y * yCoefficient) + globals.ImMax; // Converts a canvas y-coordinate value to the associated complex plane Im-coordinate.
	};

	var adjustedREMAX = function () {
		var reMax = globals.canvas.width * ((IM_MAX - IM_MIN) / globals.canvas.height) + RE_MIN;
		return reMax;
	};

	var drawMandelbrotWithWebWorkers = function (ReMax, ReMin, ImMax, ImMin, grayscaleFactor) {
		var startTime = new Date(); // Report how long it takes to render the requested Mandelbrot image.
		var messageBox = document.getElementById('message-box');
		var elapsedTime = document.getElementById('elapsed-time');
		var progressIndicator = document.getElementById('progress-indicator'); // For browsers that do not support Web Workers, we don't display the <progress> element.
		var canvas = globals.canvas; // A small speed optimization - accessing local variables tends to be faster than accessing global variables.
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
		var ctx = canvas.context;
		var imageDataObject = ctx.imageDataObject; // imageDataObject ends up receiving an altered copy of ctx.imageDataObject, so imageDataObject is not a pointer to (reference to) ctx.imageDataObject.
		var fineDetailMandelbrotReceived = false; // Just in case the fine detail Web Worker callback finishes before the coarse detail Web Worker callback.

		messageBox.innerHTML = CALCULATING_MESSAGE; // This isn't displayed until the drawMandelbrot function block exits.
		elapsedTime.innerHTML = ''; // Erase the prior run's statistics.
		progressIndicator.style.display = 'block';

		var workerMessage = {
			workerID: '',
			MAX_ITERATIONS: MAX_ITERATIONS,
			ReMax: ReMax,
			ReMin: ReMin,
			ImMax: ImMax,
			ImMin: ImMin,
			grayscaleFactor: grayscaleFactor,
			canvasWidth: canvasWidth,
			canvasHeight: canvasHeight,
			imageDataObject: imageDataObject
		};

		var workerCallback = function (evt) { // Receive the required data from the Web Worker to draw the Mandelbrot set to the canvas (plus a few other items).
			if (fineDetailMandelbrotReceived) {
				return; // For some reason, the fine detail callback finished before the coarse detail callback, do not display the coarse Mandelbrot image.
			}

			ctx.putImageData(evt.data.imageDataObject, 0, 0); // Render our carefully constructed canvas image data array to the canvas.
			globals.canvas.context.imageDataObject = evt.data.imageDataObject;
			globals.maxPixelGrayscaleValue = evt.data.maxPixelGrayscaleValue; // Store this information in case the user clicks the Lighten button.

			var elapsedMilliseconds = (new Date()) - startTime;
			elapsedTime.innerHTML = evt.data.workerID + ': ' + formatNumber(evt.data.iterationSum) + ' iterations in ' + (elapsedMilliseconds / 1000).toFixed(2) + ' seconds'; // Note that the UI element is not updated until after this block terminates (which is the desired behavior).
			elapsedTime.cssClass = 'flash';

			if (evt.data.workerID === 'Fine detail') {
				fineDetailMandelbrotReceived = true;
				messageBox.innerHTML = DEFAULT_MESSAGE; // Erase the CALCULATING_MESSAGE message and replace it with the default message.
				progressIndicator.style.display = 'none'; // Take the progress bar off the screen.
			}
		};

		globals.coarseDetailWorker.onmessage = workerCallback; // I unnecessarily set this callback each time drawMandelbrot is called - this is fine in that there's no significant performance hit.
		globals.fineDetailWorker.onmessage = workerCallback;

		workerMessage.MAX_ITERATIONS = Math.round(MAX_ITERATIONS / 2); // MAX_ITERATIONS must always be a (positive) integer.
		workerMessage.workerID = 'Coarse detail';
		globals.coarseDetailWorker.postMessage(workerMessage); // postMessage to the coarse detail Web Worker.

		workerMessage.MAX_ITERATIONS = MAX_ITERATIONS;
		workerMessage.workerID = 'Fine detail';
		globals.fineDetailWorker.postMessage(workerMessage); // postMessage to the fine detail Web Worker.
	};

	var drawMandelbrotWithoutWebWorkers = function (ReMax, ReMin, ImMax, ImMin, grayscaleFactor) {
		var messageBox = document.getElementById('message-box');
		var elapsedTime = document.getElementById('elapsed-time');

		messageBox.innerHTML = CALCULATING_MESSAGE; // This isn't displayed until the drawMandelbrot function block exits.
		elapsedTime.innerHTML = ''; // Erase the prior run's statistics.

		var calculateMandelbrot = function () {
			var startTime = new Date(); // Report how long it takes to render this particular region of the Mandelbrot set.

			var canvas = globals.canvas;
			var canvasWidth = canvas.width;
			var canvasHeight = canvas.height;
			var ctx = canvas.context;
			var imageDataObjectData = ctx.imageDataObject.data; // imageDataObjectData is a reference to, not a copy of, ctx.imageDataObject.data

			var maxPixelGrayscaleValue = 0; // This will contain the lightest shade of gray in the drawn Mandelbrot image.

			var xCoefficient = (ReMax - ReMin) / canvasWidth; // Keep the below loops as computation-free as possible.
			var yCoefficient = (ImMin - ImMax) / canvasHeight; // Keep the below loops as computation-free as possible.

			var iterationSum = 0;
			var currentPixel = 0;
			for (var y = 0; y < canvasHeight; y++) {
				var cIm = (y * yCoefficient) + ImMax; // Note that c = c_Re + c_Im*i

				for (var x = 0; x < canvasWidth; x++) {
					var cRe = (x * xCoefficient) + ReMin; // Convert the canvas x-coordinate to a complex plane Re-coordinate. c_Re represents the real part of a c value.

					var zRe = 0; // The first z value (Zo) must be 0.
					var zIm = 0; // The first z value (Zo) must be 0. Note that z = z_Re + z_Im*i

					var cBelongsToMandelbrotSet = true; // Assume that the c associated with Zn belongs to the Mandelbrot set (i.e., Zn remains bounded under iteration of Zn+1 = (Zn)^2 + c).
					var exponentialSmoothingSum = 0;
					for (var iterationCount = 1; iterationCount <= MAX_ITERATIONS; iterationCount++) {
						iterationSum++; // Keep track of how many iterations were performed in total so we can report this to the user.

						var zReSquared = zRe * zRe; // A small speed optimization.
						var zImSquared = zIm * zIm; // A small speed optimization.

						exponentialSmoothingSum += Math.exp(-(zReSquared + zImSquared)); // Technically, this should be e^(-|z|). However, avoiding the expensive square root operation doesn't really affect the resulting image.
						if (exponentialSmoothingSum >= 255) { // Don't cycle through the gray colors.
							exponentialSmoothingSum = 255;
						}

						if (zReSquared + zImSquared > 4) { // Checks if |z^2| is greater than 2. This approach avoids the expensive square root operation.
							cBelongsToMandelbrotSet = false; // This complex c value is not part of the Mandelbrot set (because it will always tend towards infinity under iteration).
							break; // Immediately check the next c value to see if it belongs to the Mandelbrot set or not.
						} // if

						// The next two lines perform Zn+1 = (Zn)^2 + c (recall that (x + yi)^2 = x^2 - y^2 + 2xyi, thus the real part is x^2 - y^2 and the imaginary part is 2xyi).
						zIm = (2 * zRe * zIm) + cIm; // We must calculate the next value of z_Im first because it depends on the current value of z_Re (not the next value of z_Re).
						zRe = zReSquared - zImSquared + cRe; // Calculate the next value of z_Re.
					} // for

					if (cBelongsToMandelbrotSet) { // This complex c value is probably part of the Mandelbrot set because Zn did not tend toward infinity within MAX_ITERATIONS iterations.
						imageDataObjectData[currentPixel++] = 0; // Red. Note that there are 255 possible shades of red, green, blue, and alpha (i.e., opacity).
						imageDataObjectData[currentPixel++] = 0; // Green.
						imageDataObjectData[currentPixel++] = 0; // Blue.
						imageDataObjectData[currentPixel++] = 255; // Alpha (i.e., 0% transparency).
					} else { // This complex c value is definitely not part of the Mandelbrot set because Zn tends toward infinity under iteration (i.e., |Zn| > 2).
						var pixelGrayscaleValue = 255 - exponentialSmoothingSum % 256; // Force the value of exponentialSmoothingSum to be between 0 and 255 inclusively. Note that all values for red, green, and blue are identical when using a grayscale.
						var adjustedPixelGrayscaleValue = pixelGrayscaleValue * grayscaleFactor;

						imageDataObjectData[currentPixel++] = adjustedPixelGrayscaleValue; // Because we mod by 256, the value of exponentialSmoothingSum will always be between 0 and 255.
						imageDataObjectData[currentPixel++] = adjustedPixelGrayscaleValue; // If exponentialSmoothingSum is 255 (its maximum possible value), then 255 % 256 = 255.
						imageDataObjectData[currentPixel++] = adjustedPixelGrayscaleValue; // When exponentialSmoothingSum is 255, we have 255 - 255 = 0, so the shade values for RGB are all set to 0 (that is, the c-value pixel is rendered black - indicating that this particular c-value very slowly tends towards infinity).
						imageDataObjectData[currentPixel++] = 255; // Always draw the c-value pixels with no transparency.

						if (pixelGrayscaleValue > maxPixelGrayscaleValue) {
							maxPixelGrayscaleValue = pixelGrayscaleValue; // Determine the lightest shade of gray in case the user clicks the Lighten button.
						} // if
					} // if-else
				} // for
			} // for

			globals.maxPixelGrayscaleValue = maxPixelGrayscaleValue; // Store the lightest shade of gray in case the user clicks the Lighten button.
			ctx.putImageData(ctx.imageDataObject, 0, 0); // Render our carefully constructed canvas image data array to the canvas.

			var elapsedMilliseconds = (new Date()) - startTime;
			elapsedTime.innerHTML = formatNumber(iterationSum) + ' iterations in ' + (elapsedMilliseconds / 1000).toFixed(2) + ' seconds'; // Note that the UI element is not updated until after this block terminates (which is the desired behavior).
			messageBox.innerHTML = DEFAULT_MESSAGE; // Erase the 'Calculating...' message and replace it with the default message.
		};

		if (window.setImmediate) {
			window.setImmediate(calculateMandelbrot); // Allow the drawMandelbrot function to immediately terminate, thus printing 'Calculating...' to the screen.
		} else {
			window.setTimeout(calculateMandelbrot, 0); // Allow the drawMandelbrot function to immediately terminate, thus printing 'Calculating...' to the screen.
		}
	};

	var handleHashChange = function () {
		var hashValues = getHashValues(); // This function examines window.location.hash but doesn't change it.

		if (hashValues) {
			globals.ReMax = hashValues.ReMax;
			globals.ReMin = hashValues.ReMin;
			globals.ImMax = hashValues.ImMax;
			globals.ImMin = hashValues.ImMin;
			globals.grayscaleFactor = hashValues.grayscaleFactor;
		} else {
			globals.ReMax = adjustedREMAX();
			globals.ReMin = RE_MIN;
			globals.ImMax = IM_MAX;
			globals.ImMin = IM_MIN;
			globals.grayscaleFactor = 1; // Multiplying any value by 1 has no effect.
		}

		if (window.Worker) { // Test for the availability of the Worker() constructor.
			initializeWebWorkers('./scripts/mandelbrotwebworker.js'); // Halt any in-process Web Workers so that the back/forward buttons behave as expected (i.e., deal with the asynchronous nature of the Web Workers).
			drawMandelbrotWithWebWorkers(globals.ReMax, globals.ReMin, globals.ImMax, globals.ImMin, globals.grayscaleFactor);
		} else {
			drawMandelbrotWithoutWebWorkers(globals.ReMax, globals.ReMin, globals.ImMax, globals.ImMin, globals.grayscaleFactor);
		}
	};

	var handlePointer = function (evt) {
		var canvasWidthHeightRatio = globals.canvas.width / globals.canvas.height;
		var ctx = globals.canvas.context;
		var point = {
			x: 0,
			y: 0
		};
		var ReMax, ReMin, ImMax, ImMin;
		var zoomBoxWidth, zoomBoxHeight;
		var canvasX, canvasY;

		if (evt.offsetX && evt.offsetY) {
			canvasX = evt.offsetX; // Not supported in Firefox.
			canvasY = evt.offsetY;
		} else {
			canvasX = evt.layerX; // Supported in Firefox.
			canvasY = evt.layerY;
		}

		var staticZoomBoxWidth = globals.staticZoomBoxWidth;
		var staticZoomBoxHeight = globals.staticZoomBoxHeight;
		var halfStaticZoomBoxWidth = staticZoomBoxWidth / 2;
		var halfStaticZoomBoxHeight = staticZoomBoxHeight / 2;

		var getTopLeftZoomBoxPoint = function (x1, y1, x2, y2) {
			// (x1, y1) is the were the down pointer event occurred. (x2, y2) is where the move or up pointer event occurred.
			if (x1 <= x2) {
				if (y1 <= y2) {
					return {
						x: x1,
						y: y1
					}; // User has drawn (or is drawing) a zoom box from the top left toward the bottom right.
				} else { // y1 > y2
					return {
						x: x1,
						y: y1 - zoomBoxHeight
					}; // User has drawn (or is drawing) a zoom box from the bottom left toward the top right.
				} // if-else
			} else { // x1 > x2
				if (y1 <= y2) {
					return {
						x: x1 - zoomBoxWidth,
						y: y1
					}; // User has drawn (or is drawing) a zoom box from the top right toward the bottom left.
				} else { // y1 > y2
					return {
						x: x1 - zoomBoxWidth,
						y: y1 - zoomBoxHeight
					}; // User has drawn (or is drawing) a zoom box from the bottom right toward the top left.
				}
			}
		};

		switch (evt.type) {
			case 'MSGestureStart':
			case 'mousedown':
				if (!globals.pointer.down) {
					globals.pointer.down = true;
					globals.pointer.x1 = canvasX;
					globals.pointer.y1 = canvasY;
				} // if
				break;
			case 'MSGestureChange':
			case 'mousemove':
				if (globals.pointer.down) {
					zoomBoxHeight = Math.abs(canvasY - globals.pointer.y1); // A physical length is always non-negative.
					zoomBoxWidth = zoomBoxHeight * canvasWidthHeightRatio; // We must keep the zoom box dimensions proportional to the canvas dimensions in order to ensure that the resulting zoomed Mandelbrot image does not become skewed.

					if (window.requestAnimationFrame.id) {
						window.cancelAnimationFrame(window.requestAnimationFrame.id);
					}
					window.requestAnimationFrame.id = window.requestAnimationFrame(function () { // If requestAnimationFrame is not supported, then this anonymous function is executed in 16.7 milliseconds (see handleLoad above). That is, as the mouse is being move, we'll get 1 animation frame every 16.7 seconds (which is roughly 60 frames per second).
						ctx.putImageData(ctx.imageDataObject, 0, 0); // Assumes that an initial image of the Mandelbrot set is drawn before we get to this point in the code. The purpose of this line is to erase the prior zoom box rectangle before drawing the next zoom box rectangle.
						point = getTopLeftZoomBoxPoint(globals.pointer.x1, globals.pointer.y1, canvasX, canvasY);
						ctx.fillRect(point.x, point.y, zoomBoxWidth, zoomBoxHeight);
					});
				}
				break;
			case 'MSGestureEnd':
			case 'mouseup':
				if (globals.pointer.down) {
					globals.pointer.down = false;

					zoomBoxHeight = Math.abs(canvasY - globals.pointer.y1); // A physical length is always non-negative.
					zoomBoxWidth = zoomBoxHeight * canvasWidthHeightRatio; // Again, ensure that the width/height ratio of the zoom box is proportional to the canvas's (this simplifies the algorithm).

					if (zoomBoxHeight === 0 || globals.holdGesture) { // No zoom box has been drawn, so honor the fixed sized zoom box.
						globals.holdGesture = false; // Indicate that the hold gesture is complete.
						ctx.putImageData(ctx.imageDataObject, 0, 0); // For the MSGestureHold case, erase the previously drawn zoom box so we don't draw two or more on top of each other.
						ctx.fillRect(canvasX - halfStaticZoomBoxWidth, canvasY - halfStaticZoomBoxHeight, staticZoomBoxWidth, staticZoomBoxHeight); // Just leave this on the screen.

						ReMin = xToRe(canvasX - halfStaticZoomBoxWidth); // Center the static zoom box about the point (evt.offsetX, evt.offsetY).
						ImMax = yToIm(canvasY - halfStaticZoomBoxHeight);

						ReMax = xToRe(canvasX + halfStaticZoomBoxWidth);
						ImMin = yToIm(canvasY + halfStaticZoomBoxHeight);
					} else { // A (possibly tiny) zoom box has been drawn, so honor it.
						point = getTopLeftZoomBoxPoint(globals.pointer.x1, globals.pointer.y1, canvasX, canvasY);

						ReMin = xToRe(point.x); // Convert the mouse's x-coordinate value (on the canvas) to the associated Re-coordinate value in the complex plane.
						ImMax = yToIm(point.y); // Convert the mouse's y-coordinate value (on the canvas) to the associated Im-coordinate value in the complex plane.

						ReMax = xToRe(point.x + zoomBoxWidth); // Convert the zoom box's final x-coordinate value to the associated Re-coordinate value in the complex plane.
						ImMin = yToIm(point.y + zoomBoxHeight); // Convert the zoom box's final y-coordinate value to the associated Re-coordinate value in the complex plane.
					}

					window.location.hash = ReMax + ',' + ReMin + ',' + ImMax + ',' + ImMin + ',' + globals.grayscaleFactor; // This triggers the handleHashChange event handler which, among other things, is responsible for drawing the Mandelbrot set.
				}
				break;
			case 'MSGestureHold':
				if (evt.detail && evt.MSGESTURE_FLAG_BEGIN) {
					globals.holdGesture = true; // Indicate that we're in the middle of a hold gesture.
					ctx.fillRect(canvasX - halfStaticZoomBoxWidth, canvasY - halfStaticZoomBoxHeight, staticZoomBoxWidth, staticZoomBoxHeight); // At the first sign of a hold gesture, get the zoom box up on the screen immediately .
				}
				// The evt.MSGESTURE_FLAG_END component of the hold gesture is handled by the 'if (zoomBoxHeight == 0 || globals.holdGesture)' clause of the above MSGestureEnd clause above.
				break;
			default: throw new Error('Error in switch statement.'); // Although unnecessary, defensive programming techniques such as this are highly recommended.

		}
	};

	var handleResetButton = function () {
		window.location.hash = adjustedREMAX() + ',' + RE_MIN + ',' + IM_MAX + ',' + IM_MIN + ',' + 1; // // This triggers the handleHashChange event handler which, among other things, is responsible for drawing the Mandelbrot set.
	};

	var handleLightenButton = function () {
		// This creates a value (factor) such that black (0) stays black and the lightest gray value in the image becomes white (255). Thus, clicking the
		// Lighten button can remove mathematical meaning of the (proper) grayscale but can make dark images more visible.
		var grayscaleFactor = 255 / globals.maxPixelGrayscaleValue; // For the canvas element, 255 is white, 0 is black.

		window.location.hash = globals.ReMax + ',' + globals.ReMin + ',' + globals.ImMax + ',' + globals.ImMin + ',' + grayscaleFactor; // This invokes handleHashChange which, among other things, is responsibile for drawing the Mandelbrot set.
	};

	var handleLoad = function () {
		loadRegions();

		var canvas = document.getElementById('mandelbrot-canvas');
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
		var ctx = canvas.getContext('2d');

		document.getElementById('message-box').innerHTML = DEFAULT_MESSAGE;

		globals.canvas = canvas;
		globals.canvas.context = ctx;
		globals.canvas.context.imageDataObject = ctx.createImageData(canvasWidth, canvasHeight); // Create an appropriately sized but empty canvas image data object.

		globals.staticZoomBoxWidth = STATIC_ZOOM_BOX_FACTOR * canvasWidth; // Maintains the original canvas width/height ratio.
		globals.staticZoomBoxHeight = STATIC_ZOOM_BOX_FACTOR * canvasHeight; // Maintains the original canvas width/height ratio.

		globals.pointer = {};
		globals.pointer.down = false;
		globals.holdGesture = false; // Indicates if it's a hold gesture or not.

		window.addEventListener('hashchange', handleHashChange, false); // This event handler executes whenever the URL hash string changes.

		if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) { // Future proofing.
			// It's either-or with MS pointer events - they cannot be registered concurrently.
			var Gesture = window.gesture || window.MSGesture; // Future proofing.
			if (Gesture) {
				globals.gesture = new Gesture();
				globals.gesture.target = canvas;

				canvas.addEventListener('MSPointerDown', function (evt) {
					globals.gesture.addPointer(evt.pointerId);
				}, false);
				canvas.addEventListener('MSGestureStart', handlePointer, false);
				canvas.addEventListener('MSGestureChange', handlePointer, false);
				canvas.addEventListener('MSGestureEnd', handlePointer, false);
				canvas.addEventListener('MSGestureHold', handlePointer, false);
			}

			canvas.addEventListener('mousedown', handlePointer, false); // Required for the case when the mouse is clicked but not moved.
			canvas.addEventListener('mouseup', handlePointer, false); // Required for the case when the mouse is clicked but not moved.

		} else {
			canvas.addEventListener('mousedown', handlePointer, false);
			canvas.addEventListener('mousemove', handlePointer, false);
			canvas.addEventListener('mouseup', handlePointer, false);
		} // if-else

		document.getElementById('reset-button').addEventListener('click', handleResetButton, false);
		document.getElementById('lighten-button').addEventListener('click', handleLightenButton, false);

		// The color and opacity of the zoom box. This is what gets saved when calling ctx.save().
		ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';

		if (!window.requestAnimationFrame) {
			window.cancelAnimationFrame = function (ID) { // If window.requestAnimationFrame doesn't exist, window.cancelAnimationFrame doesn't either.
				window.clearInterval(ID); // We'll replace window.requestAnimationFrame with window.setTimeout and window.cancelAnimationFrame with window.clearInterval.
			};

			window.requestAnimationFrame = function (callback) {
				return window.setTimeout(callback, 16.7); // If requestAnimationFrame is not supported, approximate it using 16.7 millisecond frames (roughly 60 FPS). Return the setTimeout ID value as well.
			};
		}

		handleHashChange(); // On page load, simulate a page URL change to draw the initial Mandelbrot set.
	};

	window.addEventListener('load', handleLoad, false);
}());
