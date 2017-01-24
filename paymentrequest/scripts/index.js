/* global hljs */
addEventListener('load', function() {
	'use strict';

	//Helper functions
	function forEach(selector, iteratee) {
		Array.prototype.forEach.call(document.querySelectorAll(selector), iteratee);
	}

	function getSource(func) {
		var source = (func + '')
			.replace(/^.*?\{.*\n*/, '')
			.replace(/\s*\}\s*$/, '');

		var indent = /^[\t ]+/.exec(source)[0];
		return source
			.replace(RegExp('^' + indent, 'gm'), '')
			.replace(/ /g, '\xa0')
			.replace(/\t/g, '\xa0\xa0');
	}

	//Hide message if the browser supports the Payment Request API
	if (!('PaymentRequest' in window)) {
		document.getElementById('not-supported').style.display = '';
	}

	var shippingOptionChangeHandlerString = '\n\nvar onShippingOptionChange = ' + getSource(Global.onShippingOptionChange),
		shippingAddressHandlerString = '\n\nvar onShippingAddressChange = ' + getSource(Global.onShippingAddressChange),
		getShippingOptionsString = '\n\nvar onShippingOptionChange = ' + getSource(Global.getShippingOptions);

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
	forEach('.code-expander', function(button) {
		button.addEventListener('click', function(event) {
			var currButton = event.target,
				codeSample = document.getElementById(currButton.dataset.sample).parentNode;

			currButton.textContent = currButton.classList.contains('activated') ? 'Expand code sample' : 'Minimize code sample';
			currButton.classList.toggle('activated');
			codeSample.classList.toggle('payment-sample--full');
		});
	});

	//Highlighting samples
	forEach('pre code', hljs.highlightBlock);

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
