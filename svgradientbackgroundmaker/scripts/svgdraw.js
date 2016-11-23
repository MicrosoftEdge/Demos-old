var SVGBGMAKER = SVGBGMAKER || {};

(function () {
	'use strict';

	SVGBGMAKER.cusX1 = 0;
	SVGBGMAKER.cusY1 = 0;
	SVGBGMAKER.cusX2 = 0;
	SVGBGMAKER.cusY2 = 0;
	SVGBGMAKER.cusCX = 0;
	SVGBGMAKER.cusCY = 0;
	SVGBGMAKER.cusR = 0;
	SVGBGMAKER.cusRX = 0;
	SVGBGMAKER.cusRY = 0;
	SVGBGMAKER.cusPAspectRatio = 0;

	SVGBGMAKER.sampleWidth = 0;
	SVGBGMAKER.sampleHeight = 0;
	SVGBGMAKER.gradientType = null;

	SVGBGMAKER.markup = 0;
	SVGBGMAKER.posvalue = 0;
	SVGBGMAKER.stops = 0;
	SVGBGMAKER.pAspectRatio = 0;
	SVGBGMAKER.shape = 0;

	SVGBGMAKER.selectedPos = null;
	SVGBGMAKER.selectedSize = null;

	SVGBGMAKER.cancelEvent = function (e) {
		e = e ? e : window.event;
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.cancelBubble = true;
		e.cancel = true;
		e.returnValue = false;
		return false;
	};

	SVGBGMAKER.snapX = function (pos) {
		if (pos < 10) {
			return 0;
		}
		if (SVGBGMAKER.sampleWidth / 2 - 10 < pos && pos <= SVGBGMAKER.sampleWidth / 2 + 10) {
			return SVGBGMAKER.sampleWidth / 2;
		}
		if (SVGBGMAKER.sampleWidth - 10 < pos) {
			return SVGBGMAKER.sampleWidth;
		}
		return pos;
	};

	SVGBGMAKER.snapY = function (pos) {
		if (pos < 10) {
			return 0;
		}
		if (SVGBGMAKER.sampleHeight / 2 - 10 < pos && pos <= SVGBGMAKER.sampleHeight / 2 + 10) {
			return SVGBGMAKER.sampleHeight / 2;
		}
		if (SVGBGMAKER.sampleHeight - 10 < pos) {
			return SVGBGMAKER.sampleHeight;
		}
		return pos;
	};

	SVGBGMAKER.setStartTo = function (posx, posy) {
		var line = document.getElementById('linearLine');
		line.setAttribute('x1', posx);
		line.setAttribute('y1', posy);
		var start = document.getElementById('linearStart');
		start.setAttribute('x', posx - 4);
		start.setAttribute('y', posy - 4);
		SVGBGMAKER.cusX1 = (posx / SVGBGMAKER.sampleWidth) * 100 + '%';
		SVGBGMAKER.cusY1 = (posy / SVGBGMAKER.sampleHeight) * 100 + '%';

		if (SVGBGMAKER.gradientType != null) {
			SVGBGMAKER.updateAllPanels();
		}
	};

	SVGBGMAKER.setEndTo = function (posx, posy) {
		var line = document.getElementById('linearLine');
		line.setAttribute('x2', posx);
		line.setAttribute('y2', posy);
		var end = document.getElementById('linearEnd');
		end.setAttribute('x', posx - 4);
		end.setAttribute('y', posy - 4);
		SVGBGMAKER.cusX2 = (posx / SVGBGMAKER.sampleWidth) * 100 + '%';
		SVGBGMAKER.cusY2 = (posy / SVGBGMAKER.sampleHeight) * 100 + '%';

		if (SVGBGMAKER.gradientType != null) {
			SVGBGMAKER.updateAllPanels();
		}
	};

	SVGBGMAKER.setCenterTo = function (posx, posy, isFromImport) {
		SVGBGMAKER.cusPAspectRatio = ' preserveAspectRatio="xMidYMid"';
		var c = document.getElementById('radialCenter');
		c.setAttribute('cx', posx);
		c.setAttribute('cy', posy);
		SVGBGMAKER.cusCX = (posx / SVGBGMAKER.sampleWidth) * 100 + '%';
		SVGBGMAKER.cusCY = (posy / SVGBGMAKER.sampleHeight) * 100 + '%';

		if (SVGBGMAKER.gradientType != null) {
			SVGBGMAKER.updateRadius(isFromImport);
			SVGBGMAKER.updateAllPanels();
		}
	};

	SVGBGMAKER.setRadiusTo = function (posx, posy) {
		var r = document.getElementById('radialRadius');

		var centerx, centery, X, Y;
		if (SVGBGMAKER.selectedPos === 'custom position') {
			//centerx = parseFloat(radcx) / 100 * SVGBGMAKER.sampleWidth;
			//centery = parseFloat(radcy) / 100 * SVGBGMAKER.sampleHeight;
			centerx = parseFloat(SVGBGMAKER.cusCX) / 100 * SVGBGMAKER.sampleWidth;
			centery = parseFloat(SVGBGMAKER.cusCY) / 100 * SVGBGMAKER.sampleHeight;
		} else {
			if (SVGBGMAKER.selectedPos === 'top left') { // TL
				X = '0%';
				Y = '0%';
			} else if (SVGBGMAKER.selectedPos === 'top center') { // TC
				X = '50%';
				Y = '0%';
			} else if (SVGBGMAKER.selectedPos === 'top right') { // TR
				X = '100%';
				Y = '0%';
			} else if (SVGBGMAKER.selectedPos === 'middle left') { // ML
				X = '0%';
				Y = '50%';
			} else if (SVGBGMAKER.selectedPos === 'middle center') { // MC
				X = '50%';
				Y = '50%';
			} else if (SVGBGMAKER.selectedPos === 'middle right') { // MR
				X = '100%';
				Y = '50%';
			} else if (SVGBGMAKER.selectedPos === 'bottom left') { // BL
				X = '0%';
				Y = '100%';
			} else if (SVGBGMAKER.selectedPos === 'bottom center') { // BC
				X = '50%';
				Y = '100%';
			} else if (SVGBGMAKER.selectedPos === 'bottom right') { // BR
				X = '100%';
				Y = '100%';
			}
			centerx = parseFloat(X) / 100 * SVGBGMAKER.sampleWidth;
			centery = parseFloat(Y) / 100 * SVGBGMAKER.sampleHeight;
		}

		var dist, sampleR, rPercent;
		var x, y;

		centerx = centerx * SVGBGMAKER.sampleHeight / SVGBGMAKER.sampleWidth;
		x = posx * SVGBGMAKER.sampleHeight / SVGBGMAKER.sampleWidth;
		y = posy;

		dist = Math.pow(Math.pow(x - centerx, 2) + Math.pow(y - centery, 2), 0.5);
		sampleR = Math.min(SVGBGMAKER.sampleWidth, SVGBGMAKER.sampleHeight);
		rPercent = (dist / sampleR) * 100 + '%';

		r.setAttribute('x', posx - 4);
		r.setAttribute('y', posy - 4);

		SVGBGMAKER.cusR = rPercent;
		SVGBGMAKER.cusRX = (posx / SVGBGMAKER.sampleWidth) * 100 + '%';
		SVGBGMAKER.cusRY = (posy / SVGBGMAKER.sampleHeight) * 100 + '%';

		SVGBGMAKER.radcx = SVGBGMAKER.cusRX;
		SVGBGMAKER.radcy = SVGBGMAKER.cusRY;
		if (SVGBGMAKER.gradientType != null) {
			SVGBGMAKER.updateAllPanels();
		}
	};

	SVGBGMAKER.getRadiusPoints = function (isCustomPos) {
		var rPercent = SVGBGMAKER.cusR;

		var X, Y;
		if (isCustomPos) {
			X = SVGBGMAKER.cusCX;
			Y = SVGBGMAKER.cusCY;
		} else {
			if (SVGBGMAKER.selectedPos === 'top left') { // TL
				X = '0%';
				Y = '0%';
			} else if (SVGBGMAKER.selectedPos === 'top center') { // TC
				X = '50%';
				Y = '0%';
			} else if (SVGBGMAKER.selectedPos === 'top right') { // TR
				X = '100%';
				Y = '0%';
			} else if (SVGBGMAKER.selectedPos === 'middle left') { // ML
				X = '0%';
				Y = '50%';
			} else if (SVGBGMAKER.selectedPos === 'middle center') { // MC
				X = '50%';
				Y = '50%';
			} else if (SVGBGMAKER.selectedPos === 'middle right') { // MR
				X = '100%';
				Y = '50%';
			} else if (SVGBGMAKER.selectedPos === 'bottom left') { // BL
				X = '0%';
				Y = '100%';
			} else if (SVGBGMAKER.selectedPos === 'bottom center') { // BC
				X = '50%';
				Y = '100%';
			} else if (SVGBGMAKER.selectedPos === 'bottom right') { // BR
				X = '100%';
				Y = '100%';
			}
		}

		var centerX = parseFloat(X) / 100 * SVGBGMAKER.sampleWidth;
		centerX = centerX * SVGBGMAKER.sampleHeight / SVGBGMAKER.sampleWidth;
		var centerY = parseFloat(Y) / 100 * SVGBGMAKER.sampleHeight;
		var sampleR = Math.min(SVGBGMAKER.sampleWidth, SVGBGMAKER.sampleHeight);
		var posy = centerY;

		var dist = parseFloat(rPercent) / 100 * sampleR;

		var posx = Math.pow(Math.pow(dist, 2) - Math.pow(posy - centerY, 2), 0.5) + centerX;
		posx = posx * SVGBGMAKER.sampleWidth / SVGBGMAKER.sampleHeight;

		if (posx > SVGBGMAKER.sampleWidth) {
			// Flip the x-coordinate if the ellipse is on the right side of the sample space
			posx = centerX - Math.pow(Math.pow(dist, 2) - Math.pow(posy - centerY, 2), 0.5);
			posx = posx * SVGBGMAKER.sampleWidth / SVGBGMAKER.sampleHeight;
		}

		if (posx < 0) {
			var h = SVGBGMAKER.sampleHeight;
			var fitOntoSampleSize = false;
			var flip = true;
			var incr = 1;
			var incrMul = 1;
			while (!fitOntoSampleSize) {
				var angle = Math.atan(h / SVGBGMAKER.sampleHeight);
				// The width of the radial gradient is larger than the width; locate another pointon the sample
				if ((centerX < SVGBGMAKER.sampleHeight / 2) && (centerY < SVGBGMAKER.sampleHeight / 2)) { //center of radius on TL
					posy = dist * Math.cos(angle);
					posx = Math.pow(Math.pow(dist, 2) - Math.pow(posy - centerY, 2), 0.5) + centerX;
					posx = posx * SVGBGMAKER.sampleWidth / SVGBGMAKER.sampleHeight;
				} else if ((centerX < SVGBGMAKER.sampleHeight / 2) && (centerY > SVGBGMAKER.sampleHeight / 2)) { //center of radius on BL
					posy = dist - dist * Math.cos(angle);
					posx = Math.pow(Math.pow(dist, 2) - Math.pow(posy - centerY, 2), 0.5) + centerX;
					posx = posx * SVGBGMAKER.sampleWidth / SVGBGMAKER.sampleHeight;
				} else if ((centerX > SVGBGMAKER.sampleHeight / 2) && (centerY < SVGBGMAKER.sampleHeight / 2)) { //center of radius on TR
					posy = dist * Math.cos(angle);
					posx = centerX - Math.pow(Math.pow(dist, 2) - Math.pow(posy - centerY, 2), 0.5);
					posx = posx * SVGBGMAKER.sampleWidth / SVGBGMAKER.sampleHeight;
				} else if ((centerX > SVGBGMAKER.sampleHeight / 2) && (centerY > SVGBGMAKER.sampleHeight / 2)) { //center of radius on BR
					posy = dist - dist * Math.cos(angle);
					posx = centerX - Math.pow(Math.pow(dist, 2) - Math.pow(posy - centerY, 2), 0.5);
					posx = posx * SVGBGMAKER.sampleWidth / SVGBGMAKER.sampleHeight;
				}

				posx = Math.round(posx);
				posy = Math.round(posy);

				if ((posy >= 0) && (posx >= 0) && (posx <= SVGBGMAKER.sampleWidth) && (posy <= SVGBGMAKER.sampleHeight)) {
					fitOntoSampleSize = true;
				} else {
					if (flip) {
						h += incrMul * incr;
						flip = false;
						incrMul++;
					} else {
						h -= incrMul * incr;
						flip = true;
						incrMul++;
						incr++;
					}
				}

				if (incr > 1000) { //stopping after 1000 iterations
					fitOntoSampleSize = true;
				}
			}
		}

		var pos = [];
		pos.push(posx);
		pos.push(posy);
		return pos;
	};

	SVGBGMAKER.updateRadius = function (isFromImport) {
		var centerX = parseFloat(SVGBGMAKER.cusCX) / 100 * SVGBGMAKER.sampleHeight;
		var centerY = parseFloat(SVGBGMAKER.cusCY) / 100 * SVGBGMAKER.sampleHeight;
		var radiusX = parseFloat(SVGBGMAKER.cusRX) / 100 * SVGBGMAKER.sampleHeight;
		var radiusY = parseFloat(SVGBGMAKER.cusRY) / 100 * SVGBGMAKER.sampleHeight;

		var dist = Math.pow(Math.pow(radiusX - centerX, 2) + Math.pow(radiusY - centerY, 2), 0.5);
		var sampleR = Math.min(SVGBGMAKER.sampleWidth, SVGBGMAKER.sampleHeight);
		var rPercent = (dist / sampleR) * 100 + '%';

		if (!isFromImport) {
			SVGBGMAKER.cusR = rPercent;
		}
		if (SVGBGMAKER.gradientType != null) {
			SVGBGMAKER.updateAllPanels();
		}
	};

	SVGBGMAKER.startOrEndMouseDown = function (e, setter) {
		var op = document.getElementById('otherSample');
		var rect = op.getBoundingClientRect();

		document.body.style.cursor = 'crosshair';

		document.onmousemove = function (e2) {
			var posx = Math.max(0, Math.min(SVGBGMAKER.sampleWidth, e2.clientX - rect.left));
			var posy = Math.max(0, Math.min(SVGBGMAKER.sampleHeight, e2.clientY - rect.top));

			posx = SVGBGMAKER.snapX(posx);
			posy = SVGBGMAKER.snapY(posy);

			setter(posx, posy);
			SVGBGMAKER.cancelEvent(e2);
		};

		document.onmouseup = function (e2) {
			document.onmousemove = null;
			document.onmouseup = null;
			document.body.style.cursor = '';
			SVGBGMAKER.cancelEvent(e2);
		};
		SVGBGMAKER.cancelEvent(e);
	};

	SVGBGMAKER.linearStartMouseDown = function (e) {
		SVGBGMAKER.startOrEndMouseDown(e, SVGBGMAKER.setStartTo);
	};

	SVGBGMAKER.linearEndMouseDown = function (e) {
		SVGBGMAKER.startOrEndMouseDown(e, SVGBGMAKER.setEndTo);
	};

	SVGBGMAKER.radialCenterMouseDown = function (e) {
		SVGBGMAKER.startOrEndMouseDown(e, SVGBGMAKER.setCenterTo);
	};

	SVGBGMAKER.radialRadiusMouseDown = function (e) {
		SVGBGMAKER.startOrEndMouseDown(e, SVGBGMAKER.setRadiusTo);
	};
}());