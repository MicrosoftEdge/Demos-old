(function () {
	'use strict';

	/* constants */
	var MIN_PARTICLE_SPACING = 40;
	var GRAVITY_METERS_PER_SCREEN_WIDTH = 7.272727;
	var REPULSION_PIXELS_PER_METER = 10;
	var PARTICLE_MASS = 1;
	var PARTICLE_RADIUS = 5;
	var PARTICLE_DIAMETER = 2 * PARTICLE_RADIUS;
	var GRAVITY_PARTICLE_DAMPING_FACTOR = 0.99;
	var REPULSION_PARTICLE_DAMPING_FACTOR = 0.92;
	var GRAVITY_WELL_MASS = 100;
	var MAGNETIC_MAGNITUDE = 50000;
	var GRAVITY_TETHER_SPRING_CONSTANT = .1;
	var REPULSION_TETHER_SPRING_CONSTANT = .5;
	var STEP_HZ = 60;
	var TOUCH_POINT_RADIUS = 60;
	var RAINBOW_STRIP_DOT_WIDTH = 20;
	var RAINBOW_STRIP_DOT_MAX = 210;
	var BEE_SIZE = 20;

	/* mode switches */
	var PHYSICS_MODE_GRAVITY_WELL = 0;
	var PHYSICS_MODE_REPULSION = 1;
	var TETHER_MODE_OFF = 0;
	var TETHER_MODE_ON = 1;
	var DRAW_MODE_CIRCLES = 0;
	var DRAW_MODE_RAINBOWS = 1;
	var DRAW_MODE_BALLS = 2;
	var DRAW_MODE_BEES = 3;
	var BLUR_MODE_OFF = 0;
	var BLUR_MODE_ON = 1;

	/* finals */
	var CANVAS_WIDTH;
	var CANVAS_HEIGHT;
	var GRAVITY_PIXELS_PER_METER;
	var BALL_IMAGE;
	var CIRCLE_IMAGE;
	var RAINBOW_STRIP_IMAGE;
	var BEE_IMAGE;

	/* globals */
	var canvasElm, context, downevent, upevent, moveevent;
	var particles = [];
	var touchPoints = [];
	var touchCount = 0;

	/* initial settings */
	var physicsMode = PHYSICS_MODE_GRAVITY_WELL;
	var tetherMode = TETHER_MODE_OFF;
	var drawMode = DRAW_MODE_RAINBOWS;
	var blurMode = BLUR_MODE_ON;

	var sizeCanvas = function () {
		canvasElm = document.getElementById('canvas');

		canvasElm.width = window.innerWidth;
		canvasElm.height = window.innerHeight;
	};

	// Create physics objects for the particles
	var addParticles = function () {
		CANVAS_WIDTH = parseInt(canvasElm.width);
		CANVAS_HEIGHT = parseInt(canvasElm.height);

		GRAVITY_PIXELS_PER_METER = CANVAS_WIDTH / GRAVITY_METERS_PER_SCREEN_WIDTH;

		var elemColumns = parseInt(CANVAS_WIDTH / MIN_PARTICLE_SPACING);
		var elemRows = parseInt(CANVAS_HEIGHT / MIN_PARTICLE_SPACING);
		var actualColumnSpacing = CANVAS_WIDTH / elemColumns;
		var actualRowSpacing = CANVAS_HEIGHT / elemRows;

		var i, j;

		for (i = 0; i < elemColumns; i++) {
			for (j = 0; j < elemRows; j++) {
				var elmX = i * actualColumnSpacing + actualColumnSpacing / 2;
				var elmY = j * actualRowSpacing + actualRowSpacing / 2;
				particles.push({
					x: elmX,
					y: elmY,
					vx: 0,
					vy: 0,
					startX: elmX,
					startY: elmY,
					hue: 0
				});
			}
		}
	};

	var destroyParticles = function () {
		while (particles.length > 0) {
			delete particles.pop();
		}
	};

	/*************** Start touch handling ***************/
	var moveTouchPoint = function (e) {
		var pID = e.pointerId || 0;
		if (touchPoints[pID]) {
			touchPoints[pID].x = e.offsetX || e.layerX;
			touchPoints[pID].y = e.offsetY || e.layerY;
		}
	};

	var addTouchPoint = function (e) {
		if (touchCount === 0) {
			document.addEventListener(moveevent, moveTouchPoint, false);
		}

		var pID = e.pointerId || 0;
		if (!touchPoints[pID]) {
			touchCount++;
			touchPoints[pID] = {
				x: e.offsetX || e.layerX,
				y: e.offsetY || e.layerY
			};
		}
	};

	var removeTouchPoint = function (e) {
		var pID = e.pointerId || 0;
		if (touchPoints[pID]) {
			delete touchPoints[pID];
			touchCount--;

			if (touchCount === 0) {
				document.removeEventListener(moveevent, moveTouchPoint, false);
			}
		}
	};
	/*************** End touch handling ***************/

	/*************** Start draws ***************/
	var setDrawMode = function (mode) {
		drawMode = mode;
	};

	var setBlurMode = function (mode) {
		blurMode = mode;
	};

	var calculateRainbowColor = function () {
		var speed, p;

		for (var i = 0; i < particles.length; i++) {
			p = particles[i];
			speed = Math.sqrt(Math.pow(p.vx, 2) + Math.pow(p.vy, 2));
			p.hue = Math.min(Math.round(speed / 4), RAINBOW_STRIP_DOT_MAX);
		}
	};

	var drawBalls = function () {
		var p;

		for (var i = 0; i < particles.length; i++) {
			p = particles[i];
			context.drawImage(BALL_IMAGE, p.x - PARTICLE_RADIUS, p.y - PARTICLE_RADIUS);
		}
	};

	var drawCircles = function () {
		var p;

		for (var i = 0; i < particles.length; i++) {
			p = particles[i];
			context.drawImage(CIRCLE_IMAGE, p.x - PARTICLE_RADIUS, p.y - PARTICLE_RADIUS);
		}
	};

	var drawRainbows = function () {
		var p;

		for (var i = 0; i < particles.length; i++) {
			p = particles[i];
			context.drawImage(RAINBOW_STRIP_IMAGE, RAINBOW_STRIP_DOT_WIDTH * p.hue, 0, RAINBOW_STRIP_DOT_WIDTH, RAINBOW_STRIP_DOT_WIDTH, p.x - PARTICLE_RADIUS, p.y - PARTICLE_RADIUS, PARTICLE_DIAMETER, PARTICLE_DIAMETER);
		}
	};

	var drawBees = function () {
		var p;

		for (var i = 0; i < particles.length; i++) {
			p = particles[i];
			context.save();
			context.translate(p.x, p.y);
			context.rotate(Math.atan(p.vy / p.vx) + (p.vx < 0 ? -Math.PI / 2 : Math.PI / 2));
			context.drawImage(BEE_IMAGE, -BEE_SIZE / 2, -BEE_SIZE / 2, BEE_SIZE, BEE_SIZE);
			context.restore();
		}
	};

	var drawTouchGlows = function () {
		var gradient;
		var alpha = (blurMode === BLUR_MODE_ON ? .1 : .6);

		touchPoints.forEach(function (tp) {
			context.beginPath();
			gradient = context.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, TOUCH_POINT_RADIUS);
			gradient.addColorStop(0, 'rgba(255, 255, 255, ' + alpha + ')');
			gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
			context.fillStyle = gradient;
			context.arc(tp.x, tp.y, TOUCH_POINT_RADIUS, 0, 2 * Math.PI, false);
			context.fill();
		});
	};
	/*************** End draws ***************/

	/*************** Start physics ***************/
	var setPhysicsMode = function (mode) {
		physicsMode = mode;
	};

	var setTetherMode = function (mode) {
		tetherMode = mode;
	};

	var applyDamping = function () {
		var dampingFactor;

		switch (physicsMode) {
			case PHYSICS_MODE_GRAVITY_WELL:
				dampingFactor = GRAVITY_PARTICLE_DAMPING_FACTOR;
				break;
			case PHYSICS_MODE_REPULSION:
				dampingFactor = REPULSION_PARTICLE_DAMPING_FACTOR;
				break;
		}

		particles.forEach(function (p) {
			p.vx *= dampingFactor;
			p.vy *= dampingFactor;
		});
	};

	var updatePosition = function () {
		particles.forEach(function (p) {
			p.x += p.vx / STEP_HZ;
			p.y += p.vy / STEP_HZ;
		});
	};

	var applyGravity = function () {
		var distanceVec, distanceVecMag, forceVecMag, p;

		touchPoints.forEach(function (gw) {
			for (var i = 0; i < particles.length; i++) {
				p = particles[i];
				distanceVec = {
					x: (gw.x - p.x),
					y: (gw.y - p.y)
				};
				distanceVecMag = Math.sqrt(Math.pow(distanceVec.x, 2) + Math.pow(distanceVec.y, 2));
				forceVecMag = GRAVITY_WELL_MASS * PARTICLE_MASS / Math.max(Math.pow(distanceVecMag / GRAVITY_PIXELS_PER_METER, 2), PARTICLE_RADIUS);
				p.vx += forceVecMag * distanceVec.x / distanceVecMag;
				p.vy += forceVecMag * distanceVec.y / distanceVecMag;
			}
		});
	};

	var applyRepulsion = function () {
		var distanceVec, distanceVecMag, forceVecMag, p;

		touchPoints.forEach(function (s) {
			for (var i = 0; i < particles.length; i++) {
				p = particles[i];
				distanceVec = {
					x: (s.x - p.x),
					y: (s.y - p.y)
				};
				distanceVecMag = Math.sqrt(Math.pow(distanceVec.x, 2) + Math.pow(distanceVec.y, 2));
				forceVecMag = MAGNETIC_MAGNITUDE / (4 * Math.PI * Math.max(Math.pow(distanceVecMag / REPULSION_PIXELS_PER_METER, 2), PARTICLE_RADIUS));
				p.vx -= forceVecMag * distanceVec.x / distanceVecMag;
				p.vy -= forceVecMag * distanceVec.y / distanceVecMag;
			}
		});
	};

	var applyTether = function () {
		var distanceVec, springConstant;

		switch (physicsMode) {
			case PHYSICS_MODE_GRAVITY_WELL:
				springConstant = GRAVITY_TETHER_SPRING_CONSTANT;
				break;
			case PHYSICS_MODE_REPULSION:
				springConstant = REPULSION_TETHER_SPRING_CONSTANT;
				break;
		}

		particles.forEach(function (p) {
			distanceVec = {
				x: (p.startX - p.x),
				y: (p.startY - p.y)
			};
			p.vx += distanceVec.x * springConstant / PARTICLE_MASS;
			p.vy += distanceVec.y * springConstant / PARTICLE_MASS;
		});
	};

	var stepPhysics = function () {
		// apply force to update the new frame's velocity
		switch (physicsMode) {
			case PHYSICS_MODE_GRAVITY_WELL:
				applyGravity();
				break;
			case PHYSICS_MODE_REPULSION:
				applyRepulsion();
				break;
		}

		if (tetherMode === TETHER_MODE_ON) {
			applyTether();
		}

		// dampen velocity
		applyDamping();
		// apply velocity to update the new frame's position
		updatePosition();

		// recalc hue based on new velocity if rainbows
		if (drawMode === DRAW_MODE_RAINBOWS) {
			calculateRainbowColor();
		}

		setTimeout(stepPhysics, 1000 / STEP_HZ);
	};
	/*************** End physics ***************/

	/*************** Start helpers ***************/
	var toggleControls = function () {
		var controls = document.getElementById('demo-controls');
		if (controls.className.indexOf('demo-controlsactive') !== -1) {
			controls.className = controls.className.replace('demo-controlsactive', '');
		} else {
			controls.className = 'demo-controlsactive';
		}
	};

	var turnButtonOn = function (e) {
		var buttons = e.target.parentNode.querySelectorAll('.control-button');
		for (var i = 0; i < buttons.length; i++) {
			buttons.item(i).className = buttons.item(i).className.replace(' control-button-on', '');
		}
		e.target.className += ' control-button-on';
	};

	var manuallyTurnButtonOn = function (id) {
		var buttons = document.getElementById(id).parentNode.querySelectorAll('.control-button');
		for (var i = 0; i < buttons.length; i++) {
			buttons.item(i).className = buttons.item(i).className.replace(' control-button-on', '');
		}
		document.getElementById(id).className += ' control-button-on';
	};

	var coveredInBees = function () {
		setPhysicsMode(PHYSICS_MODE_GRAVITY_WELL);
		manuallyTurnButtonOn('gravity-button');
		setDrawMode(DRAW_MODE_BEES);
		manuallyTurnButtonOn('beebutton');
		setBlurMode(BLUR_MODE_OFF);
		manuallyTurnButtonOn('bluroff-button');
		setTetherMode(TETHER_MODE_OFF);
		manuallyTurnButtonOn('tetheroff-button');
	};

	var resetState = function () {
		setPhysicsMode(PHYSICS_MODE_GRAVITY_WELL);
		manuallyTurnButtonOn('gravity-button');
		setDrawMode(DRAW_MODE_RAINBOWS);
		manuallyTurnButtonOn('rainbow-button');
		setBlurMode(BLUR_MODE_ON);
		manuallyTurnButtonOn('bluron-button');
		setTetherMode(TETHER_MODE_OFF);
		manuallyTurnButtonOn('tetheroff-button');

		destroyParticles();
		addParticles();
	};
	/*************** End helpers ***************/

	var paint = function () {
		// prep for draw
		switch (blurMode) {
			case BLUR_MODE_OFF:
				{
					context.globalAlpha = 1;
					break;
				}
			case BLUR_MODE_ON:
				{
					context.globalAlpha = 0.2;
					break;
				}
		}

		context.fillStyle = 'rgb(0, 0, 0)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.globalAlpha = 1;

		// draw glows for active contacts
		drawTouchGlows();

		// draw appropriate particles
		switch (drawMode) {
			case DRAW_MODE_RAINBOWS:
				drawRainbows();
				break;
			case DRAW_MODE_BALLS:
				drawBalls();
				break;
			case DRAW_MODE_CIRCLES:
				drawCircles();
				break;
			case DRAW_MODE_BEES:
				drawBees();
				break;
		}

		// Future-proof: when feature is fully standardized
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(paint);
		} else if (window.msRequestAnimationFrame) {        // IE implementation
			window.msRequestAnimationFrame(paint);
		} else if (window.mozRequestAnimationFrame) {       // Firefox implementation
			window.mozRequestAnimationFrame(paint);
		} else if (window.webkitRequestAnimationFrame) {    // Chrome implementation
			window.webkitRequestAnimationFrame(paint);
		} else {                                            // Other browsers that do not yet support feature
			setTimeout(paint, 1000 / STEP_HZ);
		}
	};

	// Initialize the world
	var setupWorld = function () {
		// Get canvas info
		context = canvasElm.getContext('2d');

		addParticles();

		// Determine correct events to register for
		if (navigator.pointerEnabled) {
			// Pointers supported
			downevent = 'pointerdown';
			upevent = 'pointerup';
			moveevent = 'pointermove';
			document.addEventListener('pointercancel', function (e) {
				removeTouchPoint(e);
			}, false);
			document.addEventListener('MSGestureInit', function (e) {
				if (e.preventManipulation) {
					e.preventManipulation();
				}
			}, false);
			document.addEventListener('MSHoldVisual', function (e) {
				e.preventDefault();
			}, false);
		}
		else if (navigator.msPointerEnabled) {
			// MSPointers supported
			downevent = 'MSPointerDown';
			upevent = 'MSPointerUp';
			moveevent = 'MSPointerMove';
			document.addEventListener('MSPointerCancel', function (e) {
				removeTouchPoint(e);
			}, false);
			document.addEventListener('MSGestureInit', function (e) {
				if (e.preventManipulation) {
					e.preventManipulation();
				}
			}, false);
			document.addEventListener('MSHoldVisual', function (e) {
				e.preventDefault();
			}, false);
		}
		else {
			// Pointers not supported. Defaulting to mouse events
			downevent = 'mousedown';
			upevent = 'mouseup';
			moveevent = 'mousemove';
		}

		// Register invariant events
		canvasElm.addEventListener(downevent, addTouchPoint, false);
		document.addEventListener(upevent, removeTouchPoint, false);

		document.addEventListener('contextmenu', function (e) {
			e.preventDefault();
		}, false);
		document.addEventListener('selectstart', function (e) {
			e.preventDefault();
		}, false);
		window.addEventListener('resize', function () {
			sizeCanvas();
			destroyParticles();
			addParticles();
		}, false);

		// b is for bees!
		document.addEventListener('keypress', function (e) {
			if (e.keyCode === 98) {
				coveredInBees();
			}
		}, false);
		// c is for circles!
		document.addEventListener('keypress', function (e) {
			if (e.keyCode === 99) {
				setDrawMode(DRAW_MODE_CIRCLES);
				manuallyTurnButtonOn('circle-button');
			}
		}, false);
		// r is for reset!
		document.addEventListener('keypress', function (e) {
			if (e.keyCode === 114) {
				resetState();
			}
		}, false);

		document.getElementById('demo-controlsgripper').addEventListener(downevent, toggleControls, false);

		var buttons = document.querySelectorAll('.control-button');
		for (var i = 0; i < buttons.length; i++) {
			buttons.item(i).addEventListener(downevent, turnButtonOn, false);
		}

		document.getElementById('gravity-button').addEventListener(downevent, function () {
			setPhysicsMode(PHYSICS_MODE_GRAVITY_WELL);
		}, false);
		document.getElementById('repulsion-button').addEventListener(downevent, function () {
			setPhysicsMode(PHYSICS_MODE_REPULSION);
			setTetherMode(TETHER_MODE_ON);
			manuallyTurnButtonOn('tetheron-button');
		}, false);

		document.getElementById('tetheroff-button').addEventListener(downevent, function () {
			setTetherMode(TETHER_MODE_OFF);
		}, false);
		document.getElementById('tetheron-button').addEventListener(downevent, function () {
			setTetherMode(TETHER_MODE_ON);
		}, false);

		document.getElementById('rainbow-button').addEventListener(downevent, function () {
			setDrawMode(DRAW_MODE_RAINBOWS);
		}, false);
		document.getElementById('ball-button').addEventListener(downevent, function () {
			setDrawMode(DRAW_MODE_BALLS);
		}, false);
		document.getElementById('circle-button').addEventListener(downevent, function () {
			setDrawMode(DRAW_MODE_CIRCLES);
		}, false);

		document.getElementById('bluroff-button').addEventListener(downevent, function () {
			setBlurMode(BLUR_MODE_OFF);
		}, false);
		document.getElementById('bluron-button').addEventListener(downevent, function () {
			setBlurMode(BLUR_MODE_ON);
		}, false);

		BALL_IMAGE = document.getElementById('ball');
		CIRCLE_IMAGE = document.getElementById('circle');
		RAINBOW_STRIP_IMAGE = document.getElementById('rainbow-strip');
		BEE_IMAGE = document.getElementById('bee');

		stepPhysics();
		paint();

		toggleControls(); // show the controls immediately
	};

	document.addEventListener('DOMContentLoaded', function () {
		sizeCanvas();
		setupWorld();
	}, false);
} ());