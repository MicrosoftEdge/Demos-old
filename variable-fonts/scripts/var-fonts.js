/* eslint-env browser */
/* eslint-disable no-var, prefer-template, strict, prefer-arrow-callback, object-shorthand, no-continue, no-undefined, no-constant-condition */
/*globals event*/

/*
 *	VARIABLE FONTS SCRIPTS
 *	=============================================
 */

/*
 *	FONT LOADING POLYFILL
 *	---------------------------------------------
 */

let waitForFonts = document.fonts && document.fonts.ready ? document.fonts.ready : null;
(function() {
	'use strict';

	if (!waitForFonts) {
		let onready = function(){};
		waitForFonts = new Promise((ready) => {
			return (onready = ready);
		});
		const span = document.createElement('span');
		span.setAttribute('role', 'none');
		span.setAttribute('aria-hidden', 'true');
		span.setAttribute('style', 'position:fixed;top:-100px;left:-100px;pointer-events:none;');
		span.textContent = 'Aaaaaaaaaaaaaaaaa';
		document.body.insertBefore(span, document.body.firstChild);
		const spanNaturalWidth = span.offsetWidth;
		span.style.fontFamily = '"Variable Sitka"';
		const readinessTimer = setInterval(() => {
			if (span.offsetWidth !== spanNaturalWidth) {
				clearInterval(readinessTimer);
				onready();
			}
		}, 333);
	}
}());

/*
 *	COMPONENT: PAUSE ANIMATIONS BUTTON
 *	Toggles "has-anim" class; CSS selectors and JS
 *	should be written so that animations only run
 *	when this class is present
 *	----------------------------------------------
 */

(function () {
	'use strict';

	const animButton = document.getElementById('toggle-anim');

	if (animButton) {
		const toggleAnim = function() {
			const stateName = animButton.querySelector('.c-toggle-anim__state');
			if (animButton.getAttribute('aria-pressed') === 'true') {
				animButton.setAttribute('aria-pressed', 'false');
				stateName.innerText = animButton.getAttribute('data-unpressed-text');
				document.body.classList.add('has-anim');
			} else {
				animButton.setAttribute('aria-pressed', 'true');
				stateName.innerText = animButton.getAttribute('data-pressed-text');
				document.body.classList.remove('has-anim');
			}
		};

		const showAnimButton = function() {
			document.body.classList.add('has-anim');
			animButton.removeAttribute('aria-hidden');
			animButton.setAttribute('aria-pressed', 'false');
			animButton.addEventListener('click', toggleAnim, false);
		};

		showAnimButton();
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
		const slideAnnouncer = document.getElementById('slideAnnouncer');

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
				poem.style.transform = 'translateX(-' + ((poemIndex - 1) * slidePaneWidth) + '%)';

				// Timeout = transition timing of the poem transform
				setTimeout(function(){
					const newWords = newSlide.querySelectorAll('.poem__line > span, .poem__line > span > span[class]');
					for (var i = 0; i < newWords.length; i++) {
						newWords[i].style.animationPlayState = 'running';
						// Safari seems to forget to recompute the animation state otherwise
						if (navigator.vendor === 'Apple Computer, Inc.') {
							newWords[i].style.animationName = 'safari-workaround';
							window.getComputedStyle(newWords[i]).getPropertyValue('animation-name');
							newWords[i].style.animationName = '';
						}
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
				poem.style.transform = 'translateX(-' + ((poemIndex - 1) * slidePaneWidth) + '%)';

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
			slideAnnouncer.innerText = 'Slide ' + poemIndex + ' of ' + poemSlides.length;
		}
	};

	// SET UP POEM CAROUSEL FUNCTIONALITY AND SHOW FIRST SLIDE
	const setUpPoem = function() {
		const poemControls = document.createElement('ul');

		// Set up pagination
		poemControls.className = 'u-simple-list poem__controls';
		poemControls.innerHTML = '<li class="poem__prev"><button disabled class="poem__prev-btn"><span class="u-sr-only">Previous slide</span><svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="29"><path fill="none" stroke="#424F5E" stroke-width="2" stroke-miterlimit="10" d="M13.6 2.5l-12 12 12 12"/></svg></button></li>' +
								 '<li class="poem__next"><button class="poem__next-btn"><span class="u-sr-only">Next slide</span><svg xmlns="http://www.w3.org/2000/svg" width="14.5" height="29"><path fill="none" stroke="#424F5E" stroke-width="2" stroke-miterlimit="10" d="M1 2.5l12 12-12 12"/></svg></button></li>';

		poemViewer.appendChild(poemControls);
		poemControls.querySelector('.poem__prev').addEventListener('click', function(){
			updateSlide('previous');
		});
		poemControls.querySelector('.poem__next').addEventListener('click', function(){
			updateSlide('next');
		});

		// Set up visually-hidden div which announces new slides
		const slideAnnouncer = document.createElement('p');
		slideAnnouncer.setAttribute('id', 'slideAnnouncer');
		slideAnnouncer.setAttribute('aria-live', 'polite');
		slideAnnouncer.setAttribute('aria-atomic', 'true');
		slideAnnouncer.setAttribute('class', 'u-sr-only');
		slideAnnouncer.innerText = 'Slide ' + poemIndex + ' of ' + poemSlides.length;
		poemViewer.appendChild(slideAnnouncer);

		// Show first slide
		poemSlides[0].style.display = 'block';
		poemSlides[0].setAttribute('data-current', 'true');
		poemViewer.style.display = 'block';

		// Hide inactive slides from screen reader
		for (var i = 1; i < poemSlides.length; i++) {
			poemSlides[i].setAttribute('aria-hidden', 'true');
		}

		// wait for layout to happen
		waitForFonts.then(function() {
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
							if (word.offsetLeft <= lastOffset || (word.className !== lastClass && lines.length > 1 && lines[lines.length - 2].style.left === '1em')) {
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
		});
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

	if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
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
	}

	// DETECT GRADIENT TRANSITION SUPPORT
	const detectGradientTransitionSupport = function() {
		const gradientDetector = Object.assign(document.body.appendChild(document.createElement('div')), { id: 'no-gradient-transition-test' });
		requestAnimationFrame(function() {
			if (getComputedStyle(gradientDetector).backgroundImage !== 'linear-gradient(1deg, rgba(0, 0, 0, 0.5) 0%, rgba(102, 102, 102, 0.5) 100%)') {
				document.body.classList.add('no-gradient-transition');
			}
			gradientDetector.remove();
		});
	};
	detectGradientTransitionSupport();

	// ICE DRIFT ANIMATION
	const startIceDriftAnimation = function() {
		if (document.body.classList.contains('has-anim')) {
			var svgBox = document.querySelector('.ice-floes > .svg-center').getBBox();
			var svgCenterX = svgBox.x + (svgBox.width / 2);
			var svgCenterY = svgBox.y + (svgBox.height / 2);
			for (var path of document.querySelectorAll('.ice-floes > path')) {
				var box = path.getBBox();
				var centerX = box.x + (box.width / 2);
				var centerY = box.y + (box.height / 2);
				var dx = (centerX - svgCenterX) / 1.25;
				var dy = (centerY - svgCenterY) / 1.25;
				path.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
				path.style.opacity = '.3';
			}
			document.querySelector('.ice-floes').classList.add('drift-started');
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
	if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
		const poemZoneObserver = new IntersectionObserver((entries) => {
			return entries.forEach((e) => {
				if (e.intersectionRatio >= 0.1) {
					startIceDriftAnimation();
				}
			});
		}, { threshold: 0.1 });
		poemZoneObserver.observe(document.querySelector('#poem'));
	}
}());

/*
 *	DECOVAR ANIMATION
 *	---------------------------------------------
 */

(function () {
	'use strict';

	if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
		const decovarObserver = new IntersectionObserver((entries) => {
			return entries.forEach((e) => {
				if (e.intersectionRatio >= 0.1) {
					e.target.classList.add('is-in-view');
				} else {
					e.target.classList.remove('is-in-view');
				}
			});
		}, { threshold: 0.1 });
		decovarObserver.observe(document.querySelector('.vf-decovar'));
	} else {
		document.querySelector('.vf-decovar').classList.add('is-in-view');
	}
}());