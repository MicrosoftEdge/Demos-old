/* eslint-env browser */
/* eslint-disable no-var, prefer-template, strict, prefer-arrow-callback, object-shorthand, no-continue, no-undefined, no-constant-condition */
/*globals event*/

/*
 *	VARIABLE FONTS SCRIPTS
 *	=============================================
 */

/*
 *	FEATURE SUPPORT ALERT
 *	---------------------------------------------
 */

(function () {
	'use strict';

	/* These scripts are written old-school so that they work on older browsers */
	var closeAlert = function(e) {
		if (e.target.id === 'dismissFeatureAlert') {
			var featureAlert = document.getElementById('featureAlert');
			document.body.removeChild(featureAlert);
			document.body.classList.remove('has-alert');
			document.querySelector('.c-nav-bar').focus();
		}
	};

	var insertAlert = function() {
		var featureAlertMsg = '<strong>Notice:</strong> This page demonstrates variable fonts, which is not supported in your browser version. For the full experience, please view in Microsoft Edge build 17074+ or <a href="https://developer.microsoft.com/en-us/microsoft-edge/platform/status/fontvariationpropertieswithopentypevariablefontsupport/">any browser that supports variable fonts</a>.',
			featureAlert = document.createElement('div');

		featureAlert.className = 'c-alert c-alert--error';
		featureAlert.setAttribute('role', 'alert');
		featureAlert.setAttribute('aria-live', 'polite');
		featureAlert.setAttribute('id', 'featureAlert');

		document.body.insertBefore(featureAlert, document.body.querySelector(':first-child'));
		document.body.className += 'has-alert';

		/* Set trivial timeout to trigger aria-live readout cross-browser */
		setTimeout(function(){
			featureAlert.innerHTML = '<div class="l-contain c-alert__contain"><p class="c-alert__message">' + featureAlertMsg + '</p><button class="c-alert__dismiss" aria-label="Close alert" aria-controls="featureAlert" id="dismissFeatureAlert"></button></div>';
		}, 10);

		/* Makes heading focusable by JS, for when alert is cleared */
		document.querySelector('.c-nav-bar').setAttribute('tabindex', '-1');
		window.addEventListener('click', closeAlert, false);
	};

	/* Render alert if font-variation-settings isn't supported */
	if (window.CSS === undefined || !CSS.supports('font-variation-settings', '"wdth" 100')) { //no-undefined
		insertAlert();
	}
}());


/*
 *	POEM DEMO
 *	---------------------------------------------
 */

(function () {
	'use strict';

	const poemViewer = document.querySelector('.poem-viewer'),
		  poem = poemViewer.querySelector('.poem'),
		  poemSlides = poemViewer.querySelectorAll('.poem__slide'),
		  slidePaneWidth = 100 / poemSlides.length,
		  timeReservedForAxisTransition = 75,
		  lineByLineSemiInterval = -125,
		  lineByLineInterval = 100,
		  wordByWordInterval = 16;

	let poemIndex = 1;

	// UPDATE SLIDE FROM POEM CONTROLS
	const updateSlide = function(slideDir) {
		const currentSlide = poemViewer.querySelector('.poem__slide[data-current]');
		const prevBtn = poemViewer.querySelector('.poem__prev-btn');
		const nextBtn = poemViewer.querySelector('.poem__next-btn');

		const newSlide = slideDir === 'next' ?
			currentSlide.nextElementSibling :
			currentSlide.previousElementSibling;

		if (newSlide) {
			currentSlide.removeAttribute('data-current');
			currentSlide.setAttribute('aria-hidden', 'true');

			newSlide.setAttribute('data-current', 'true');
			newSlide.removeAttribute('aria-hidden');

			if (slideDir === 'next') {
				poemIndex++;
				poem.style.transform = 'translateX(-' + ((poemIndex - 1) * slidePaneWidth) + ')';

				// Timeout = transition timing of the poem transform
				setTimeout(function(){
					const newWords = newSlide.querySelectorAll('.poem__line > span, .poem__line > span > span[class]');
					for (var i = 0; i < newWords.length; i++) {
						newWords[i].style.animationPlayState = 'running';
					}

					if (prevBtn.hasAttribute('disabled')) {
						prevBtn.removeAttribute('disabled');
					}

					if (!newSlide.nextElementSibling) {
						nextBtn.setAttribute('disabled', 'true');
					}
				}, 400);
			} else {
				poemIndex--;
				poem.style.transform = 'translateX(-' + ((poemIndex - 1) * slidePaneWidth) + ')';

				// Timeout = transition timing of the poem transform
				setTimeout(function(){
					if (nextBtn.hasAttribute('disabled')) {
						nextBtn.removeAttribute('disabled');
					}

					if (!newSlide.previousElementSibling) {
						prevBtn.setAttribute('disabled', 'true');
					}
				}, 400);
			}
		}
	};

	// SET UP POEM CAROUSEL FUNCTIONALITY AND SHOW FIRST SLIDE
	const setUpPoem = function() {
		const poemControls = document.createElement('ul');

		// Set up pagination
		poemControls.className = 'u-simple-list poem__controls';
		poemControls.innerHTML = '<li class="poem__prev"><button disabled class="poem__prev-btn"><svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="29"><path fill="none" stroke="#424F5E" stroke-width="2" stroke-miterlimit="10" d="M13.6 2.5l-12 12 12 12"/></svg></button></li>' +
								 '<li class="poem__next"><button class="poem__next-btn"><svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="29"><path fill="none" stroke="#424F5E" stroke-width="2" stroke-miterlimit="10" d="M1 2.5l12 12-12 12"/></svg></button></li>';

		poemViewer.appendChild(poemControls);
		poemControls.querySelector('.poem__prev').addEventListener('click', function(){
			updateSlide('previous');
		});
		poemControls.querySelector('.poem__next').addEventListener('click', function(){
			updateSlide('next');
		});

		// Set up visually-hidden div which announces new slides
		const poemSlideIndex = document.createElement('p');
		poemSlideIndex.setAttribute('aria-live', 'polite');
		poemSlideIndex.setAttribute('aria-atomic', 'true');
		poemSlideIndex.setAttribute('class', 'u-sr-only');
		poemSlideIndex.innerText = 'Slide ' + poemIndex + ' of ' + poemSlides.length;
		poemViewer.appendChild(poemSlideIndex);

		// Show first slide
		poemSlides[0].style.display = 'block';
		poemSlides[0].setAttribute('data-current', 'true');
		poemViewer.style.display = 'block';

		// Hide inactive slides from screen reader
		for (var i = 1; i < poemSlides.length; i++) {
			poemSlides[i].setAttribute('aria-hidden', 'true');
		}

		// wait for layout to happen
		setTimeout(function() {
			// Assign animation offsets to each word of the poem
			for (var slide of poemSlides) {
				var pendingDuration = 0;
				for (var stanzaLine of slide.querySelectorAll('.poem__line')) {
					var stanzaWords = stanzaLine.querySelectorAll('span');
					var lines = [], currentLine = null, lineDuration = 0, lastOffset = Number.NEGATIVE_INFINITY, lastClass = '';

					// divide the poem words into animated lines or semi-lines
					for (var word of stanzaWords) {
						if (word.offsetLeft <= lastOffset || word.className !== lastClass || currentLine === null) {
							// finalize the current line, if any
							if (currentLine) {
								currentLine.style.animationDuration = lineDuration + 'ms';
								pendingDuration += lineDuration;
								lineDuration = 0;

								// if the next line is a semi-line, add the special animation delay modifier
								if (word.offsetLeft <= lastOffset) {
									pendingDuration += lineByLineSemiInterval;
								}

								// if the previous line hadd to be axis-animated, we have to delay more
								if (lastClass) {
									pendingDuration += timeReservedForAxisTransition;
								}
							}

							// create the next line
							currentLine = document.createElement('span');
							currentLine.style.animationDelay = (pendingDuration) + 'ms';
							pendingDuration += lineByLineInterval;
							lines.push(currentLine);

							// if the current line is a semi-line, we want to indent it
							if (word.offsetLeft <= lastOffset) {
								currentLine.style.position = 'relative';
								currentLine.style.left = '1em';
							}
						}

						// add the current word to the current line
						lastOffset = word.offsetLeft + word.offsetWidth;
						lastClass = word.className;
						const newWord = word.cloneNode(true);
						if (lastClass) {
							newWord.style.animationDelay = (pendingDuration + lineDuration + timeReservedForAxisTransition) + 'ms';
						}
						lineDuration += word.offsetWidth * (400 / 50);
						lineDuration += wordByWordInterval;
						currentLine.appendChild(newWord);
						currentLine.appendChild(document.createTextNode(' '));
					}

					// finalize the last line
					currentLine.style.animationDuration = lineDuration + 'ms';
					pendingDuration += lineDuration + lineByLineInterval;
					lineDuration = 0;

					// replace the default content by the new lines
					stanzaLine.textContent = '';
					for (var line of lines) {
						stanzaLine.appendChild(line);
					}
				}
			}
		}, 100);
	};

	setUpPoem();

	// ANIMATE FONT-WEIGHT ON HEADINGS WHEN THEY ARE IN VIEW
	const animateHeader = function(guideHeader, ratio) {
		if (ratio > 0) {
			if (false && guideHeader.tagName === 'H2') {
				setTimeout(function() {
					guideHeader.classList.add('in-view');
				}, 500);
			} else {
				guideHeader.classList.add('in-view');
			}
		} else if (false && guideHeader.tagName === 'H2') {
			setTimeout(function() {
				guideHeader.classList.remove('in-view');
			}, 500);
		} else {
			guideHeader.classList.remove('in-view');
		}
	};

	const guideHeaders = document.querySelectorAll('.guide-content h2');
	const guideHeadersObserver = new IntersectionObserver((entries) => {
		return entries.forEach((e) => {
			animateHeader(e.target, e.intersectionRatio);
		});
	}, { threshold: 0.3 });
	for (const guideHeader of guideHeaders) {
		guideHeadersObserver.observe(guideHeader);
		guideHeadersObserver.observe(guideHeader.closest('section'));
	}

	// DETECT GRADIENT TRANSITION SUPPORT
	const detectGradientTransitionSupport = function() {
		const gradientDetector = Object.assign(document.body.appendChild(document.createElement('div')), { id: 'no-gradient-transition-test' });
		requestAnimationFrame(function() {
			console.log(getComputedStyle(gradientDetector).backgroundImage);
			if (getComputedStyle(gradientDetector).backgroundImage !== 'linear-gradient(1deg, rgba(0, 0, 0, 0.5) 0%, rgba(102, 102, 102, 0.5) 100%)') {
				document.documentElement.classList.add('no-gradient-transition');
			}
			gradientDetector.remove();
		});
	};
	detectGradientTransitionSupport();

	// ICE DRIFT ANIMATION
	const startIceDriftAnimation = function() {
		var svgBox = document.querySelector('.ice-floes').getBBox();
		var svgCenterX = (svgBox.x + svgBox.width) / 2;
		var svgCenterY = (svgBox.y + svgBox.height) / 2;
		for (var path of document.querySelectorAll('.ice-floes > path')) {
			var box = path.getBBox();
			var centerX = (box.x + box.width) / 2;
			var centerY = (box.y + box.height) / 2;
			path.style.transform = 'translate(' + (centerX - svgCenterX) + 'px, ' + (centerY - svgCenterY) + 'px)';
			path.style.opacity = '.3';
		}
	};

	// start directly on click
	document.querySelector('.poem-start').addEventListener('click', function(e) {
		e.preventDefault();
		document.querySelector('#poem').scrollIntoView({block: 'center', behavior: 'smooth'});
		startIceDriftAnimation();
		return false;
	});

	// also start once scrolling has revealed 10% of the poem
	const poemZoneObserver = new IntersectionObserver((entries) => {
		return entries.forEach((e) => {
			if (e.intersectionRatio >= 0.1) {
				startIceDriftAnimation();
			}
		});
	}, { threshold: 0.1 });
	poemZoneObserver.observe(document.querySelector('#poem'));
}());