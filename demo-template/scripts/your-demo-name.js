/*
 *	NAME OF YOUR DEMO
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
		var featureAlertMsg = '<strong>Notice:</strong> This page demonstrates [feature], which is not supported in your browser version. For the full experience, please view in Microsoft Edge [build #/version info] or <a href="https://status.microsoftedge.com">any browser that supports [feature]</a>.',
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

	/* Add your own feature query conditions here, run insertAlert() only if false */
	insertAlert();
}());