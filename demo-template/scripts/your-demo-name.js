/*
 *	NAME OF YOUR DEMO
 *	=============================================
 */

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
				console.log('animations were off');
				animButton.setAttribute('aria-pressed', 'false');
				stateName.innerText = animButton.getAttribute('data-unpressed-text');
				document.body.classList.add('has-anim');
			} else {
				console.log('animations were on');
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