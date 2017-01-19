/* global hljs */
window.onload = function() {
	'use strict';

	let staticShipping = document.getElementById('static-shipping-sample'),
		dynamicShipping = document.getElementById('dynamic-shipping-sample'),
		noShipping = document.getElementById('no-shipping-sample'),
		requestContact = document.getElementById('request-contact-sample'),
		staticShippingBtn = document.getElementById('static-shipping'),
		dynamicShippingBtn = document.getElementById('dynamic-shipping'),
		noShippingBtn = document.getElementById('no-shipping'),
		requestContactBtn = document.getElementById('request-contact-info'),
		notSupportedMessage = document.getElementById('not-supported'),
		Global = window.Global,
		shippingOptionChangeHandlerString = `\n\nvar onShippingOptionChange = ${Global.onShippingOptionChange.toString()}`,
		shippingAddressHandlerString = `\n\nvar onShippingAddressChange = ${Global.onShippingAddressChange.toString()}`,
		getShippingOptionsString = `\n\nvar onShippingOptionChange = ${Global.getShippingOptions.toString()}`;

	//Loading the same code into the HTML
	staticShipping.innerHTML = Global.startPaymentRequestStaticShipping.toString() + shippingOptionChangeHandlerString;
	dynamicShipping.innerHTML = Global.startPaymentRequestDynamicShipping.toString() + getShippingOptionsString + shippingOptionChangeHandlerString + shippingAddressHandlerString;
	noShipping.innerHTML = Global.startPaymentRequestDigitalMerchandise.toString() + shippingAddressHandlerString + shippingOptionChangeHandlerString;
	requestContact.innerHTML = Global.startPaymentRequestWithContactInfo.toString() + shippingOptionChangeHandlerString;

	//attaching event listeners
	staticShippingBtn.addEventListener('click', Global.startPaymentRequestStaticShipping);
	dynamicShippingBtn.addEventListener('click', Global.startPaymentRequestDynamicShipping);
	noShippingBtn.addEventListener('click', Global.startPaymentRequestDigitalMerchandise);
	requestContactBtn.addEventListener('click', Global.startPaymentRequestWithContactInfo);

	//helper function
	const forEach = function(selector, iteratee) {
		Array.prototype.forEach.call(document.querySelectorAll(selector), iteratee);
	};

	//Show message if the browser doesn't support the Payment Request API
	if (!('PaymentRequest' in window)) {
		notSupportedMessage.innerHTML = 'This browser does not support web payments. You should try the Microsoft Edge browser!';
	}

	//Expand/minimize code sample height
	forEach('.code-expander', function(button) {
		button.addEventListener('click', function(event) {
			const currButton = event.target;
			const text = currButton.classList.contains('activated') ? 'Expand code sample' : 'Minimize code sample';
			const codeSample = document.getElementById(currButton.dataset.sample).parentNode;
			currButton.innerHTML = text;
			currButton.classList.toggle('activated');
			console.log(codeSample);
			codeSample.classList.toggle('payment-sample--full');
		});
	});

	//highlighting samples
	forEach('pre code', function(div) {
		hljs.highlightBlock(div);
	});
};
