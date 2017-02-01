/* global Global, hljs */
addEventListener('load', function() {
	'use strict';

	//Helper functions
	var $ = function(selector) {
		return Array.prototype.slice.call(document.querySelectorAll(selector));
	};

	var getBody = function(source) {
		return (source + '')
			.replace(/^.*?\{.*\n*/, '')
			.replace(/\s*\}\s*$/, '');
	};

	var normalize = function(source, indention) {
		var string = (source + '');
		var body = getBody(string);
		var oldIndent = (/^[\t ]+/).exec(body)[0];
		var newIndent = Array((indention || 0) + 1).join(' ');
		var newBody = body.replace(RegExp('^' + oldIndent, 'gm'), newIndent);
		return string
			.replace(body, newBody)
			.replace(/\bfunction\s+\(/g, 'function(')
			.replace(/[\t ]*\}\s*$/, '}')
			.replace(/ /g, '\xa0')
			.replace(/\t/g, '\xa0\xa0');
	};

	var getSource = function(func) {
		return getBody(normalize(func, 0))
			.replace(/\bGlobal\./g, '');
	};

	var warning = document.getElementById('not-supported');

	//Show message if the browser supports the Payment Request API
	if (!('PaymentRequest' in window)) {
		warning.style.display = '';
		warning.innerHTML = '<p>This browser does not support web payments. You should try <a href="https://microsoft.com/windows/microsoft-edge">Microsoft Edge</a>, or <a href="http://caniuse.com/#search=Payment%20Request%20API">other browsers</a> that support them.</p>';
	}

	var shippingOptionChangeHandlerString = '\n\nvar onShippingOptionChange = ' + normalize(Global.onShippingOptionChange, 2) + ';',
		shippingAddressHandlerString = '\n\nvar onShippingAddressChange = ' + normalize(Global.onShippingAddressChange, 2) + ';',
		getShippingOptionsString = '\n\nvar onShippingOptionChange = ' + normalize(Global.getShippingOptions, 2) + ';';

	//Loading the same code into the HTML
	document.getElementById('static-shipping-sample').textContent = (
		getSource(Global.startPaymentRequestStaticShipping) +
		shippingOptionChangeHandlerString
	);

	document.getElementById('dynamic-shipping-sample').textContent = (
		getSource(Global.startPaymentRequestDynamicShipping) +
		getShippingOptionsString +
		shippingOptionChangeHandlerString +
		shippingAddressHandlerString
	);

	document.getElementById('no-shipping-sample').textContent = (
		getSource(Global.startPaymentRequestDigitalMerchandise) +
		shippingAddressHandlerString +
		shippingOptionChangeHandlerString
	);

	document.getElementById('request-contact-sample').textContent = (
		getSource(Global.startPaymentRequestWithContactInfo) +
		shippingOptionChangeHandlerString
	);

	//Expand/minimize code sample height
	$('.code-expander').forEach(function(button) {
		button.addEventListener('click', function(event) {
			var currButton = event.target,
				codeSample = document.getElementById(currButton.dataset.sample).parentNode;

			currButton.textContent = currButton.classList.contains('activated') ? 'Expand code sample' : 'Minimize code sample';
			currButton.classList.toggle('activated');
			codeSample.classList.toggle('payment-sample--full');
		});
	});

	//Highlighting samples
	$('pre code').forEach(hljs.highlightBlock);

	//Attaching event listeners
	document.getElementById('static-shipping')
		.addEventListener('click', Global.startPaymentRequestStaticShipping);

	document.getElementById('dynamic-shipping')
		.addEventListener('click', Global.startPaymentRequestDynamicShipping);

	document.getElementById('no-shipping')
		.addEventListener('click', Global.startPaymentRequestDigitalMerchandise);

	document.getElementById('request-contact-info')
		.addEventListener('click', Global.startPaymentRequestWithContactInfo);
});
