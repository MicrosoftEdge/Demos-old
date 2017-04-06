/*global Performance, MSGesture*/
var sceneWidth = 0;
var sceneHeight = 0;

(function () {
	'use strict';
	/***************************************************************************
	 ** Copyright © Microsoft Corporation. All Rights Reserved.
	 ** Demo Authors: Jatinder Mann and Karlito Bonnevie, Microsoft Corporation
	 ****************************************************************************/

	// 3D Model Constants
	var constants = {
		canvasWidth: 1000, // In pixels.
		canvasHeight: 1000, // In pixels.
		xMin: 0,
		xMax: Math.PI,
		yMin: 0,
		yMax: 2 * Math.PI,
		xDelta: .15, // Make smaller for more surface points.
		yDelta: .15, // Make smaller for more surface points.
		radius: 13, // The radius of the sphere
		dTheta: Math.PI / 100, // The angle delta, in radians, by which to rotate the surface
		xTheta: Math.PI / 100,
		yTheta: Math.PI / 100,
		zTheta: Math.PI / 100,
		preXTheta: Math.PI / 100,
		preYTheta: Math.PI / 100,
		surfaceScale: 50, // An empirically derived constant that makes the surface a good size for the given canvas size.
		steadyStateScale: 26,
		IMAGE_SIZE: 32,
		imageSize: 32,
		objectRadius: 250,
		steadyStateAngle: Math.PI / 1000,
		gestureScale: 1,
		bounceDecrease: false
	};

	// Pixel Constants
	var X = 0;
	var Y = 1;

	// Math Constants
	var S = [
		[1.25, 0, 0],
		[0, 1.25, 0],
		[0, 0, 1.25]
	];
	var Rg = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	var xDelta = 0;
	var yDelta = 0;

	// State variables
	var friction = false;
	var frictionStart = false;
	var bounceStart = false;
	var secondaryBounce = false;
	var expandStart = false;
	var gradientStart = false;
	var inRegion = true;
	var clicked = false;
	var FRAMES_TO_STABLIZE = 50;
	var callbackEfficiency = 0;

	// Canvas variables
	var ctx;
	var canvasElement;
	var sphere;
	var callbackTimer = 0;
	var performance;
	var currentX = 0;
	var currentY = 0;

	// Keyboard variables
	var leftArrow = 37;
	var upArrow = 38;
	var rightArrow = 39;
	var downArrow = 40;
	var enterKey = 13;

	// -----------------------------------------------------------------------------------------------------
	var point = function (x, y, z) {
		/*	Given a (x, y, z) surface point, returns the 3 x 1 vector form of the point. */
		return [x, y, z]; // Return a 3 x 1 vector representing a traditional (x, y, z) surface point. This vector form eases matrix multiplication.
	};

	// -----------------------------------------------------------------------------------------------------
	var Surface = function () {
		/* A surface is a list of (x, y, z) points, in 3 x 1 vector format. */
		this.points = []; // An array of surface points in vector format. That is, each element of this array is a 3 x 1 array, as in [ [x1, y1, z1], [x2, y2, z2], [x3, y3, z3], ... ]
		this.startPoints = [];
	};

	// -----------------------------------------------------------------------------------------------------
	var surface = new Surface(); // A set of points (in vector format) representing the surface.

	// -----------------------------------------------------------------------------------------------------
	Surface.prototype.updateAngle = function (x, y, z) {
		/*	Updates the rotation matrixes with a new angle. */
		if (isFinite(x)) {
			constants.xTheta = x;
		}
		if (isFinite(y)) {
			constants.yTheta = y;
		}
		if (isFinite(z)) {
			constants.zTheta = z;
		}

		var xCOS = Math.cos(constants.xTheta);
		var yCOS = Math.cos(constants.yTheta);
		var zCOS = Math.cos(constants.zTheta);
		var xSIN = Math.sin(constants.xTheta);
		var ySIN = Math.sin(constants.yTheta);
		var zSIN = Math.sin(constants.zTheta);

		Rg = [
			[yCOS * zCOS, -1 * xCOS * zSIN + xSIN * ySIN * zCOS, xSIN * zSIN + xCOS * ySIN * zCOS],
			[yCOS * zSIN, xCOS * zCOS + xSIN * ySIN * zSIN, -1 * xSIN * zCOS + xCOS * ySIN * zSIN],
			[-1 * ySIN, xSIN * yCOS, xCOS * yCOS]
		];
	};

	// -----------------------------------------------------------------------------------------------------
	Surface.prototype.updateSomeAngles = function (x, y, z, updateX, updateY, updateZ) {
		/* 	Updates the rotation matrixes with a new angle. */
		if (updateX && isFinite(x)) {
			constants.xTheta = x;
		}
		if (updateY && isFinite(y)) {
			constants.yTheta = y;
		}
		if (updateZ && isFinite(z)) {
			constants.zTheta = z;
		}
		if (constants.zTheta === Math.PI) {
			constants.zTheta = Math.PI / 1000;
		}

		var xCOS = Math.cos(constants.xTheta);
		var yCOS = Math.cos(constants.yTheta);
		var zCOS = Math.cos(constants.zTheta);
		var xSIN = Math.sin(constants.xTheta);
		var ySIN = Math.sin(constants.yTheta);
		var zSIN = Math.sin(constants.zTheta);

		Rg = [
			[yCOS * zCOS, -1 * xCOS * zSIN + xSIN * ySIN * zCOS, xSIN * zSIN + xCOS * ySIN * zCOS],
			[yCOS * zSIN, xCOS * zCOS + xSIN * ySIN * zSIN, -1 * xSIN * zCOS + xCOS * ySIN * zSIN],
			[-1 * ySIN, xSIN * yCOS, xCOS * yCOS]
		];
	};

	// -----------------------------------------------------------------------------------------------------
	Surface.prototype.generate = function () {
		/* 	Creates a list of (x, y, z) points (in 3 x 1 vector format) representing the surface. */
		var i = 0;
		for (var x = constants.xMin; x <= constants.xMax; x += constants.xDelta) {
			for (var y = constants.yMin; y <= constants.yMax; y += constants.yDelta) {
				//Formula for sphere
				this.points[i] = point(constants.radius * Math.sin(x) * Math.cos(y), constants.radius * Math.sin(x) * Math.sin(y), constants.radius * Math.cos(x));
				++i;
			}
		}
		this.copyPoints(this.points, this.startPoints);
	};

	// -----------------------------------------------------------------------------------------------------
	Surface.prototype.copyPoints = function (sourceArray, destinationArray) {
		/* Copy points from the sourceArray to the destinationArray. */
		for (var i = 0; i < sourceArray.length; i++) {
			destinationArray[i] = point(sourceArray[i][0], sourceArray[i][1], sourceArray[i][2]);
		}
	};

	// -----------------------------------------------------------------------------------------------------
	Surface.prototype.multi = function (R) {
		/* 	Assumes that R is a 3 x 3 matrix and that this.points (i.e., P) is a 3 x n matrix. This method performs P = R * P. */
		var Px = 0;
		var Py = 0;
		var Pz = 0;
		var P = this.points; // P is a pointer to the set of surface points (i.e., the set of 3 x 1 vectors).
		var sum; // The sum for each row/column matrix product.

		for (var V = 0; V < P.length; V++) // For all 3 x 1 vectors in the point list.
		{
			Px = P[V][0];
			Py = P[V][1];
			Pz = P[V][2];
			for (var Rrow = 0; Rrow < 3; Rrow++) // For each row in the R matrix.
			{
				sum = R[Rrow][0] * Px + R[Rrow][1] * Py + R[Rrow][2] * Pz;
				P[V][Rrow] = sum;
			}
		}
	};

	// -----------------------------------------------------------------------------------------------------
	Surface.prototype.erase = function () {
		ctx.clearRect(-constants.canvasWidth / 2, -constants.canvasHeight / 2, canvasElement.width, canvasElement.height);
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.expandEffect = function () {
		expandStart = true;

		// Stop expanding
		setTimeout(function () {
			expandStart = false;
		}, 750);

		// Reset to enterance effect
		setTimeout(function () {
			surface.copyPoints(surface.startPoints, surface.points);
			surface.updateAngle(Math.PI / 100, Math.PI / 100, Math.PI / 100);
			constants.surfaceScale = 50;
			bounceStart = true;
			constants.bounceDecrease = true;
		}, 1000);
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.gradientEffect = function () {

		if (gradientStart) {
			document.getElementById('backgradient1').style.display = 'block';
			document.getElementById('backgradient2').style.display = 'none';
		} else {
			document.getElementById('backgradient2').style.display = 'block';
			document.getElementById('backgradient1').style.display = 'none';
		}

		gradientStart = !gradientStart;
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.bounceBackEffect = function () {
		// If decreasing effect
		if (constants.bounceDecrease) {
			if (constants.surfaceScale > constants.steadyStateScale - 3 && !secondaryBounce) {
				constants.surfaceScale -= 2;
				constants.imageSize = (constants.imageSize > constants.IMAGE_SIZE) ? constants.imageSize - 0.5 : constants.imageSize;
			} else {
				secondaryBounce = true;
				if (constants.surfaceScale !== constants.steadyStateScale) {
					constants.surfaceScale++;
					constants.imageSize = constants.IMAGE_SIZE;
				} else {
					bounceStart = false;
					secondaryBounce = false;
					constants.gestureScale = 1;
					constants.objectRadius = constants.radius * constants.surfaceScale;
					surface.updateAngle(constants.steadyStateAngle, constants.steadyStateAngle, constants.steadyStateAngle);
				}
			}
		} else {
			if (constants.surfaceScale < constants.steadyStateScale + 3 && !secondaryBounce) {
				constants.surfaceScale += 2;
				constants.imageSize = (constants.imageSize < constants.IMAGE_SIZE) ? constants.imageSize + 1 : constants.imageSize;
			} else {
				secondaryBounce = true;
				if (constants.surfaceScale !== constants.steadyStateScale) {
					constants.surfaceScale--;
					constants.imageSize = constants.IMAGE_SIZE;
				} else {
					bounceStart = false;
					secondaryBounce = false;
					constants.gestureScale = 1;
					constants.objectRadius = constants.radius * constants.surfaceScale;
					surface.updateAngle(constants.steadyStateAngle, constants.steadyStateAngle, constants.steadyStateAngle);
				}
			}
		}
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.frictionEffect = function () {
		if (!friction) {
			// If theta hasn't changed for a while, stablize
			if (constants.xTheta === constants.preXTheta && constants.yTheta === constants.preYTheta) {
				friction = true;
				FRAMES_TO_STABLIZE = 50;

				// Stablize in the direction of the current movement.
				if (constants.yTheta < 0) {
					yDelta = ((-1 * constants.steadyStateAngle) - constants.yTheta) / FRAMES_TO_STABLIZE;
				}
				else {
					yDelta = (constants.steadyStateAngle - constants.yTheta) / FRAMES_TO_STABLIZE;
				}

				if (constants.xTheta < 0) {
					xDelta = ((-1 * constants.steadyStateAngle) - constants.xTheta) / FRAMES_TO_STABLIZE;
				}
				else {
					xDelta = (constants.steadyStateAngle - constants.xTheta) / FRAMES_TO_STABLIZE;
				}
			} else {
				constants.preXTheta = constants.xTheta;
				constants.preYTheta = constants.yTheta;
			}
		} else {
			if (FRAMES_TO_STABLIZE <= 0) {
				friction = false;
				frictionStart = false;
			} else {
				FRAMES_TO_STABLIZE--;
				surface.updateSomeAngles(constants.xTheta + xDelta, constants.yTheta + yDelta, 0, true, true, false);
			}
		}
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.sortByZIndex = function (a, b) {
		return a[2] - b[2];
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.calculateAlpha = function (z, min) {
		// 1 = max z index
		return ((z / 40) - (z * min) / 40 + (min / 2) + 0.5);
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.calculateScale = function (z, min, max) {
		// 1 = max z index
		return (max - min) / (2 * constants.radius) * (z + constants.radius) + min;
	};

	//------------------------------------------------------------------------------------------------------
	Surface.prototype.draw = function () {
		//sort by Z index
		this.points = surface.points.sort(surface.sortByZIndex);

		// If not expanding, scale furthest away points
		if (!expandStart) {
			for (var i = 0; i < this.points.length; i++) {
				//ctx.save();

				ctx.globalAlpha = this.calculateAlpha(this.points[i][2], 0.5);
				var scale = this.calculateScale(this.points[i][2], 0.75, 1.25);
				ctx.scale(scale, scale);
				ctx.drawImage(sphere, this.points[i][X] * constants.surfaceScale, this.points[i][Y] * constants.surfaceScale, constants.imageSize, constants.imageSize);
				ctx.scale(1 / scale, 1 / scale);
				//ctx.restore();
			}
		} else {
			for (var i = 0; i < this.points.length; i++) {
				ctx.globalAlpha = this.calculateAlpha(this.points[i][2], 0.5);
				ctx.drawImage(sphere, this.points[i][X] * constants.surfaceScale, this.points[i][Y] * constants.surfaceScale, constants.imageSize, constants.imageSize);
			}
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var countCallbacks = function () {
		callbackEfficiency++;

		// Setup next set of callbacks
		if (window.setImmediate) {
			callbackTimer = window.setImmediate(countCallbacks);
		}
		else if (window.msSetImmediate) {
			callbackTimer = window.msSetImmediate(countCallbacks);
		}
		else if (window.mozSetImmediate) {
			callbackTimer = window.mozSetImmediate(countCallbacks);
		}
		else if (window.webkitSetImmediate) {
			callbackTimer = window.webkitSetImmediate(countCallbacks);
		}
		else if (window.oSetImmediate) {
			callbackTimer = window.oSetImmediate(countCallbacks);
		}
		else {
			callbackTimer = window.setTimeout(countCallbacks);
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var render = function () {
		// FPS count
		performance.beginDrawLoop();

		// Callback efficiency; number of frames I have available to do other work
		performance.callbackEfficiency = Math.min(callbackEfficiency, 10) / 10;
		performance.callbackInstances++;
		if (callbackTimer !== 0) {
			if (window.clearImmediate) {
				window.clearImmediate(callbackTimer);
			}
			else if (window.msClearImmediate) {
				window.msClearImmediate(callbackTimer);
			}
			else if (window.mozClearImmediate) {
				window.mozClearImmediate(callbackTimer);
			}
			else if (window.webkitClearImmediate) {
				window.webKitClearImmediate(callbackTimer);
			}
			else if (window.oClearImmediate) {
				window.oClearImmediate(callbackTimer);
			}
			else {
				window.clearTimeout(callbackTimer);
			}

			// Reset value;
			callbackTimer = 0;
			callbackEfficiency = 0;
		}

		// Drawing functions
		surface.erase(); // Erase the canvas, then draw the next scene
		surface.multi(Rg); // Calculate the next rotation

		if (frictionStart) {
			surface.frictionEffect();
		}
		if (bounceStart) {
			surface.bounceBackEffect();
		}
		if (expandStart) {
			surface.multi(S);
		}
		surface.gradientEffect(); // gradient
		surface.draw(); // Draw the scene

		// Use requestAnimationFrame to schedule animations
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(render);
		}
		else if (window.msRequestAnimationFrame) {
			window.msRequestAnimationFrame(render);
		}
		else if (window.mozRequestAnimationFrame) {
			window.mozRequestAnimationFrame(render);
		}
		else if (window.webkitRequestAnimationFrame) {
			window.webkitRequestAnimationFrame(render);
		}
		else if (window.oRequestAnimationFrame) {
			window.oRequestAnimationFrame(render);
		}
		else {
			setTimeout(render, 16);
		}

		// Determine if there is enough CPU available for 10 callbacks
		if (window.setImmediate) {
			callbackTimer = window.setImmediate(countCallbacks);
		}
		else if (window.msSetImmediate) {
			callbackTimer = window.msSetImmediate(countCallbacks);
		}
		else if (window.mozSetImmediate) {
			callbackTimer = window.mozSetImmediate(countCallbacks);
		}
		else if (window.webkitSetImmediate) {
			callbackTimer = window.webkitSetImmediate(countCallbacks);
		}
		else if (window.oSetImmediate) {
			callbackTimer = window.oSetImmediate(countCallbacks);
		}
		else {
			callbackTimer = window.setTimeout(countCallbacks);
		}

		// Finish drawing score dashboard
		performance.finishDrawLoop();
		performance.drawDashboard();
	};

	// -----------------------------------------------------------------------------------------------------
	// My thanks to QuirksMode.org for the insight here in helping make Mouse events work in Firefox.
	var getRelativePos = function (x, y) {
		var curleft = 0;
		var curtop = 0;

		var obj = document.getElementById('myCanvas');
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while ((obj = obj.offsetParent));
		}

		// Webkit isn't compliant with CSS OM View here; thus, we need to grab scrollTop from body instead of documentElement

		if (document.body.scrollLeft > 0) {
			var scrollLeft = document.body.scrollLeft;
		} else {
			scrollLeft = document.documentElement.scrollLeft;
		}

		if (document.body.scrollTop > 0) {
			var scrollTop = document.body.scrollTop;
		} else {
			scrollTop = document.documentElement.scrollTop;
		}

		return [(x - curleft + scrollLeft), (y - curtop + scrollTop)];
	};

	// -----------------------------------------------------------------------------------------------------
	var mousePointerDownListener = function (e) {
		clicked = true;

		// Check if e.offsetX is supported - Firefox issue
		if (typeof e.offsetX !== 'undefined' && typeof e.offsetY !== 'undefined') {
			currentX = e.offsetX;
			currentY = e.offsetY;
		} else {
			var relPos = getRelativePos(e.clientX, e.clientY);
			currentX = relPos[0];
			currentY = relPos[1];
		}

		if ((currentX > constants.canvasWidth / 2 - constants.objectRadius * 2) && (currentX < constants.canvasWidth / 2 + constants.objectRadius * 2)) {
			inRegion = true;
			if (e.preventDefault) {
				e.preventDefault(); // Prevent default actions
			}
		}
		else {
			inRegion = false;
		}

		if ((currentX > constants.canvasWidth / 2 - constants.objectRadius / 4) && (currentX < constants.canvasWidth / 2 + constants.objectRadius / 4) && (currentY > constants.canvasHeight / 2 - constants.objectRadius / 4) && (currentY < constants.canvasHeight / 2 + constants.objectRadius / 4)) {
			surface.expandEffect();
			clicked = false;
			inRegion = false;
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var pointerDownListener = function (e) {
		var target = e.target;
		if (window.MSGesture) {
			target._gesture.addPointer(e.pointerId);
		}

		clicked = true;

		// Check if e.offsetX is supported - Firefox issue
		if (typeof e.offsetX !== 'undefined' && typeof e.offsetY !== 'undefined') {
			currentX = e.offsetX;
			currentY = e.offsetY;
		} else {
			var relPos = getRelativePos(e.clientX, e.clientY);
			currentX = relPos[0];
			currentY = relPos[1];
		}

		if ((currentX > constants.canvasWidth / 2 - constants.objectRadius * 2) && (currentX < constants.canvasWidth / 2 + constants.objectRadius * 2)) {
			inRegion = true;
			if (e.preventDefault) {
				e.preventDefault(); // Prevent default actions
			}
		}
		else {
			inRegion = false;
		}

		if ((currentX > constants.canvasWidth / 2 - constants.objectRadius / 4) && (currentX < constants.canvasWidth / 2 + constants.objectRadius / 4) && (currentY > constants.canvasHeight / 2 - constants.objectRadius / 4) && (currentY < constants.canvasHeight / 2 + constants.objectRadius / 4)) {
			surface.expandEffect();
			clicked = false;
			inRegion = false;
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var mousePointerMoveListener = function (e) {
		if (clicked && inRegion) {
			if (frictionStart) {
				frictionStart = false;
				friction = false;
			}

			var newX = 0;
			var newY = 0;

			// Check if e.offsetX is supported - Firefox issue
			if (typeof e.offsetX !== 'undefined' && typeof e.offsetY !== 'undefined') {
				newX = e.offsetX;
				newY = e.offsetY;
			} else {
				var relPos = getRelativePos(e.clientX, e.clientY);
				newX = relPos[0];
				newY = relPos[1];
			}

			var angleX = ((newX - currentX) / constants.objectRadius / 50) * (Math.PI / 2);
			var angleY = ((-1 * (newY - currentY)) / constants.objectRadius / 50) * (Math.PI / 2);

			surface.updateSomeAngles(angleY, angleX, 0, true, true, false);
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var mousePointerUpListener = function () {
		// Set Friction
		frictionStart = false;
		friction = false;
		clicked = false;
		inRegion = false;
		setTimeout(function () {
			frictionStart = true;
		}, 100);
	};

	// -----------------------------------------------------------------------------------------------------
	var gestureStartListener = function (e) {
		if (inRegion) {
			if (e.preventDefault) {
				e.preventDefault();
			}

			// If friction is on, turn it off
			if (frictionStart) {
				frictionStart = false;
				friction = false;
			}

			var angleX = (e.translationX / constants.objectRadius / 50) * (Math.PI / 2);
			var angleY = ((-1 * e.translationY) / constants.objectRadius / 50) * (Math.PI / 2);

			surface.updateSomeAngles(angleY, angleX, 0, true, true, false);
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var gestureChangeListener = function (e) {
		if (inRegion) {
			if (e.preventDefault()) {
				e.preventDefault();
			}

			// If friction is on, turn it off
			if (frictionStart) {
				frictionStart = false;
				friction = false;
			}

			var angleX = (e.translationX / constants.objectRadius / 50) * (Math.PI / 2);
			var angleY = ((-1 * e.translationY) / constants.objectRadius / 50) * (Math.PI / 2);

			surface.updateSomeAngles(angleY, angleX, 0, true, true, false);

			if (e.scale !== 1) {
				bounceStart = false;
				secondaryBounce = false;
				constants.surfaceScale = Math.floor(e.scale * (230 / 9) + (4 / 9));
				constants.objectRadius = constants.radius * constants.surfaceScale;

				// If scale is negative, decrease size. Else increase
				if ((e.scale - constants.gestureScale) < 0) {
					if ((constants.imageSize - constants.IMAGE_SIZE / 2) > constants.IMAGE_SIZE / 2) {
						constants.imageSize = (constants.imageSize > constants.IMAGE_SIZE) ? constants.imageSize - 1 : constants.imageSize;
					}
					else {
						constants.imageSize = (constants.imageSize > constants.IMAGE_SIZE / 2) ? constants.imageSize - 1 : constants.imageSize;
					}
				} else {
					constants.imageSize = (constants.imageSize < constants.IMAGE_SIZE * 2) ? constants.imageSize + 1 : constants.imageSize;
				}
			}
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var gestureEndListener = function (e) {
		if (e.preventDefault()) {
			e.preventDefault();
		}

		if (e.scale !== 1) {
			if (constants.gestureScale > 1) {
				bounceStart = true;
				constants.bounceDecrease = true;
			} else {
				bounceStart = true;
				constants.bounceDecrease = false;
			}
		}

		// Set Friction
		frictionStart = false;
		friction = false;
		inRegion = false;
		setTimeout(function () {
			frictionStart = true;
		}, 100);
	};

	// -----------------------------------------------------------------------------------------------------
	var keyboardDownListener = function (e) {
		// If there is friction, cancel it
		if (frictionStart) {
			frictionStart = false;
			friction = false;
		}

		switch (e.keyCode) {
			// Increase Y angle
			case upArrow:
				surface.updateSomeAngles(constants.xTheta + Math.PI / 100, 0, 0, true, false, false);
				break;
			// Decrease Y angle
			case downArrow:
				surface.updateSomeAngles(constants.xTheta - Math.PI / 100, 0, 0, true, false, false);
				break;
			// Decrease X angle
			case leftArrow:
				surface.updateSomeAngles(0, constants.yTheta - Math.PI / 100, 0, false, true, false);
				break;
			// Increase X angle
			case rightArrow:
				surface.updateSomeAngles(0, constants.yTheta + Math.PI / 100, 0, false, true, false);
				break;
			// Press Enter and blowup
			case enterKey:
				surface.expandEffect();
				break;
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var keyboardUpListener = function () {
		if (!bounceStart) {
			// When the keyboard key is lifted, kick in the friction
			// Set Friction
			frictionStart = false;
			friction = false;
			setTimeout(function () {
				frictionStart = true;
			}, 100);

			// If zooming, bounce back
			if (constants.gestureScale !== 1) {
				if (constants.gestureScale > 1) {
					bounceStart = true;
					constants.bounceDecrease = true;
				} else {
					bounceStart = true;
					constants.bounceDecrease = false;
				}
			}
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var appendCanvasElement = function () {
		/* Creates and then appends the 'myCanvas' canvas element to the DOM. */
		var container = document.getElementById('canvas-container');
		canvasElement = document.createElement('canvas');

		// Code requiring canvas support
		if (canvasElement.getContext && canvasElement.getContext('2d')) {

			canvasElement.width = constants.canvasWidth = container.clientWidth;
			canvasElement.height = constants.canvasHeight = window.innerHeight;
			sceneWidth = container.clientWidth;
			sceneHeight = window.innerHeight;
			canvasElement.id = 'myCanvas';
			container.appendChild(canvasElement); // Make the canvas element a child of the body element.
			ctx = canvasElement.getContext('2d');
			ctx.translate(constants.canvasWidth / 2, constants.canvasHeight / 2); // Translate the surface's origin to the center of the canvas.

			sphere = document.getElementById('sphere');

			// Reduce size if smaller screen
			if (constants.canvasHeight <= 705) {
				constants.steadyStateScale = 20;
				constants.imageSize = constants.IMAGE_SIZE = 28;
			}

			constants.objectRadius = constants.radius * constants.surfaceScale;
			return true;
		}
		// Canvas isn't available. Put non-canvas fallback here
		else {
			document.getElementById('not-supported').style.display = 'block';
			return false;
		}
	};

	var resize = function () {
		var container = document.getElementById('canvas-container');
		canvasElement.width = constants.canvasWidth = container.clientWidth;
		canvasElement.height = constants.canvasHeight = window.innerHeight;
		sceneWidth = container.clientWidth;
		sceneHeight = window.innerHeight;
		performance.resize();

		ctx.translate(constants.canvasWidth / 2, constants.canvasHeight / 2); // Translate the surface's origin to the center of the canvas.

		// Reduce size if smaller screen
		if (constants.canvasHeight <= 705) {
			constants.steadyStateScale = 20;
			constants.imageSize = constants.IMAGE_SIZE = 28;
		}
		constants.objectRadius = constants.radius * constants.surfaceScale;
	};

	// -----------------------------------------------------------------------------------------------------
	var windowResize = function () {
		if (window.setImmediate) {
			setImmediate(resize);
		} else {
			setTimeout(resize, 0);
		}
	};

	// -----------------------------------------------------------------------------------------------------
	var registerEvents = function () {
		if (window.MSGesture) {
			canvasElement._gesture = new MSGesture();
			canvasElement._gesture.target = canvasElement;

			//In Microsoft Edge there is only the unprefixed API
			if (window.PointerEvent) {
				canvasElement.addEventListener('pointerdown', pointerDownListener, false);
				canvasElement.addEventListener('pointermove', mousePointerMoveListener, false);
				canvasElement.addEventListener('pointerup', mousePointerUpListener, false);
			} else {
				canvasElement.addEventListener('MSPointerDown', pointerDownListener, false);
				canvasElement.addEventListener('MSPointerMove', mousePointerMoveListener, false);
				canvasElement.addEventListener('MSPointerUp', mousePointerUpListener, false);
			}

			window.addEventListener('MSGestureChange', gestureChangeListener, true);

		} else {

			canvasElement.addEventListener('mousedown', mousePointerDownListener, false);
			canvasElement.addEventListener('mousemove', mousePointerMoveListener, false);
			canvasElement.addEventListener('mouseup', mousePointerUpListener, false);

			// iOS touch events
			canvasElement.addEventListener('touchmove', gestureChangeListener, false);
			canvasElement.addEventListener('touchend', gestureEndListener, false);
			canvasElement.addEventListener('touchstart', gestureStartListener, false);
			canvasElement.addEventListener('touchcancel', gestureEndListener, false);
		}

		window.addEventListener('contextmenu', function (e) {
			if (e.preventDefault) {
				e.preventDefault();
			}
		}, false);
		window.addEventListener('resize', windowResize, false);
		document.addEventListener('keydown', keyboardDownListener, true);
		document.addEventListener('keyup', keyboardUpListener, true);
	};

	// -----------------------------------------------------------------------------------------------------
	var onloadInit = function () {
		// Create and append the canvas element to the DOM.
		if (appendCanvasElement()) {
			performance = new Performance();
			surface.updateAngle(constants.dTheta, constants.dTheta, constants.dTheta);
			surface.draw(); // Draw the surface on the canvas.

			// Add Entrance effect
			bounceStart = true;
			constants.bounceDecrease = true;

			// Register events
			registerEvents();

			// Use requestAnimationFrame if supported, otherwise fallback to setTimeout
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(render);
			}
			else if (window.msRequestAnimationFrame) {
				window.msRequestAnimationFrame(render);
			}
			else if (window.mozRequestAnimationFrame) {
				window.mozRequestAnimationFrame(render);
			}
			else if (window.webkitRequestAnimationFrame) {
				window.webkitRequestAnimationFrame(render);
			}
			else {
				setTimeout(render, 16);
			}
		}
	};

	//----------------------------------------------------------------------------------------------------------
	surface.generate(); // Creates the set of points representing the surface. Must be called before color().

	if (window.addEventListener) {
		window.addEventListener('load', onloadInit, false);
	}
	// Perform processing that must occur after the page has fully loaded.
	else if (window.attachEvent) {
		window.attachEvent('onload', onloadInit);
	}
} ());
