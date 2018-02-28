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
			var pageContent = document.getElementById('main');
			var featureAlert = document.getElementById('featureAlert');
			pageContent.removeChild(featureAlert);
		}
	};

	var checkFeatureSupport = function() {
		var featureAlertMsg = 'This page demonstrates [feature], which is not supported in your browser. For the full experience, please view in Microsoft Edge [build #/version info] or another browser supporting [feature]. <a href="[caniuse link]">See browser support details</a>',
			featureAlert = document.createElement('div'),
			pageContent = document.getElementById('main');

		featureAlert.className = 'c-alert c-alert--error';
		featureAlert.setAttribute('role', 'alert');
		featureAlert.setAttribute('aria-live', 'assertive');
		featureAlert.setAttribute('id', 'featureAlert');
		featureAlert.setAttribute('aria-label', 'Error message');
		featureAlert.innerHTML = '<div class="" role="alert" aria-live="assertive" id="featureAlert" aria-label="Error message"><div class="l-contain c-alert__contain"><p class="c-alert__message">' + featureAlertMsg + '</p><button class="c-alert__dismiss" aria-label="Close alert" aria-controls="featureAlert" id="dismissFeatureAlert"></button></div></div>';

		/* Add your own feature query conditions here, insert this node only if false */
		pageContent.insertBefore(featureAlert, pageContent.querySelector(':first-child'));
		window.addEventListener('click', closeAlert, false);
	};

	checkFeatureSupport();
}());