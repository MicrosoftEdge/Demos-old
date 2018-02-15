/* eslint-env browser */
/* eslint-disable no-var, prefer-template, strict, prefer-arrow-callback, object-shorthand, no-continue */
/*globals event*/

/*
 *	VARIABLE FONTS SCRIPTS
 *	=============================================
 */

/*
 *	POEM DEMO
 *	---------------------------------------------
 */

(function () {
	'use strict';

	const poemViewer = document.querySelector('.poem-viewer');
	const poem = poemViewer.querySelector('.poem');
	const poemSlides = poemViewer.querySelectorAll('.poem__slide');
	const slidePaneWidth = 100 / poemSlides.length;
	let poemIndex = 1;
	
	// SET UP POEM CAROUSEL FUNCTIONALITY AND SHOW FIRST SLIDE
	const setUpPoem = function() {
		const poemControls = document.createElement('ul');

		// Assign animation offsets to each word of the poem; start at 2nd slide
		for (var i = 1; i < poemSlides.length; i++) {
			const phrases = poemSlides[i].querySelectorAll('.poem__line > span');
			let phraseDelay = 0;
			for (var w = 0; w < phrases.length; w++) {
				const phraseInterval = phrases[w].textContent.length * 110;

				// Animation timing + delays are based on character count
				phrases[w].style.animationDuration = phraseInterval + 'ms';
				phrases[w].style.animationDelay = phraseDelay + 'ms';
				phraseDelay += phraseInterval;
			}
		}

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
	};

	setUpPoem();

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
				poem.style.transform = 'translateX(-' + (poemIndex - 1) * slidePaneWidth + '%)';

				// Timeout = transition timing of the poem transform
				setTimeout(function(){
					const newWords = newSlide.querySelectorAll('.poem__line > span');
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
				poem.style.transform = 'translateX(-' + (poemIndex - 1) * slidePaneWidth + '%)';

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
}());