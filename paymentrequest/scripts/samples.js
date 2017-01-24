/* global PaymentRequest */
(function(){
	'use strict';

	//Global object
	window.Global = {};

	//shipping option change handler
	const onShippingOptionChange = function(pr, details, subtotal, tax) {
		if (pr.shippingOption) {
			let shippingOption;
			for (let index = 0; index < details.shippingOptions.length; index++) {
				const opt = details.shippingOptions[index];
				if (opt.id === pr.shippingOption) {
					shippingOption = opt;
					break;
				}
			}
			if (!shippingOption) {
				return;
			}
			console.log(`shippingOptionChange: ${shippingOption.label}`);
			const shippingCost = Number(shippingOption.amount.value);

			details.displayItems = [{
				label: 'Sub-total',
				amount: { currency: 'USD', value: subtotal.toFixed(2) }
			}, {
				label: 'Shipping',
				amount: { currency: 'USD', value: shippingCost.toFixed(2) },
				pending: false
			}, {
				label: 'Sales Tax',
				amount: { currency: 'USD', value: tax.toFixed(2) }
			}];
			const totalAmount = subtotal + shippingCost + tax;
			details.total.amount.value = Math.max(0, totalAmount).toFixed(2);
		}
	};
	window.Global.onShippingOptionChange = onShippingOptionChange;

	//function to get shipping options per state
	const getShippingOptions = function(state) {
		switch (state) {
			case 'WA':
				return [{
					id: 'NO_RUSH',
					label: 'No-Rush Shipping',
					amount: { currency: 'USD', value: '0.00' },
					selected: true
				}, {
					id: 'STANDARD',
					label: 'Standard Shipping',
					amount: { currency: 'USD', value: '5.00' }
				}, {
					id: 'EXPEDITED',
					label: 'Two-Day Shipping',
					amount: { currency: 'USD', value: '7.00' }
				}];
			default:
				return [{
					id: 'NO_RUSH',
					label: 'No-Rush Shipping',
					amount: { currency: 'USD', value: '0.00' },
					selected: true
				}, {
					id: 'STANDARD',
					label: 'Standard Shipping',
					amount: { currency: 'USD', value: '6.00' }
				}, {
					id: 'EXPEDITED',
					label: 'Two-Day Shipping',
					amount: { currency: 'USD', value: '8.00' }
				}];
		}
	};
	window.Global.getShippingOptions = getShippingOptions;

	//shipping address change handler
	const onShippingAddressChange = function(pr, details) {
		const addr = pr.shippingAddress;
		const strAddr = `${addr.addressLine[0]}, ${addr.region} ${addr.postalCode}`;
		console.log(`shippingAddressChange: ${strAddr}`);

		if (addr.country === 'US') {
			details.shippingOptions = getShippingOptions(addr.region);
			// shipping no longer pending, pre-selected
			details.displayItems[1].pending = false;
		} else {
			delete details.shippingOptions;
		}
	};
	window.Global.onShippingAddressChange = onShippingAddressChange;

	window.Global.startPaymentRequestStaticShipping = function () {
		const methodData = [{
			supportedMethods: ['basic-card'],
			data: {
				supportedNetworks: ['visa', 'mastercard', 'amex'],
				supportedTypes: ['credit']
			}
		}];

		const subtotal = 44.00;
		const tax = 4.40;
		const details = {
			total: {
				label: 'Total due',
				amount: { currency: 'USD', value: (subtotal + tax).toFixed(2) }
			},
			displayItems: [{
				label: 'Sub-total',
				amount: { currency: 'USD', value: subtotal.toFixed(2) }
			}, {
				label: 'Shipping',
				amount: { currency: 'USD', value: '0.00' },
				pending: true
			}, {
				label: 'Sales Tax',
				amount: { currency: 'USD', value: tax.toFixed(2) }
			}],
			shippingOptions: [{
				id: 'NO_RUSH',
				label: 'No-Rush Shipping',
				amount: { currency: 'USD', value: '0.00' },
				selected: true
			}, {
				id: 'STANDARD',
				label: 'Standard Shipping',
				amount: { currency: 'USD', value: '5.00' }
			}, {
				id: 'EXPEDITED',
				label: 'Two-Day Shipping',
				amount: { currency: 'USD', value: '7.00' }
			}]
		};

		const options = {requestShipping: true};

		//constructor
		const request = new PaymentRequest(methodData, details, options);

		//Listen to a shipping option change
		request.addEventListener('shippingoptionchange', function (changeEvent) {
			changeEvent.updateWith(new Promise(function (resolve) {
				onShippingOptionChange(request, details, subtotal, tax);
				resolve(details);
			}));
		});

		//Show the Native UI
		request.show()

		//When the promise is fulfilled, show the Wallet's success view
		//In a real world scenario, the result obj would be sent
		//to the server side for processing.
		.then(function (result) {
			return result.complete('success');
		})
		.catch(function(err){
			console.error('Uh oh, bad payment response!', err.message);
		});
	};

	window.Global.startPaymentRequestDynamicShipping = function () {
		const methodData = [{
			supportedMethods: ['basic-card'],
			data: {
				supportedNetworks: ['visa', 'mastercard', 'amex'],
				supportedTypes: ['credit']
			}
		}];

		const subtotal = 44.00;
		const tax = 4.40;
		const details = {
			total: {
				label: 'Total due',
				amount: { currency: 'USD', value: (subtotal + tax).toFixed(2) }
			},
			displayItems: [{
				label: 'Sub-total',
				amount: { currency: 'USD', value: subtotal.toFixed(2) }
			}, {
				label: 'Shipping',
				amount: { currency: 'USD', value: '0.00' },
				pending: true
			}, {
				label: 'Sales Tax',
				amount: { currency: 'USD', value: tax.toFixed(2) }
			}]
		};

		const options = {requestShipping: true};

		//constructor
		const request = new PaymentRequest(methodData, details, options);

		//Listen to a shipping address change
		request.addEventListener('shippingaddresschange', function (changeEvent) {
			changeEvent.updateWith(new Promise(function (resolve) {
				onShippingAddressChange(request, details);
				resolve(details);
			}));
		});

		//Listen to a shipping option change
		request.addEventListener('shippingoptionchange', function (changeEvent) {
			changeEvent.updateWith(new Promise(function (resolve) {
				onShippingOptionChange(request, details, subtotal, tax);
				resolve(details);
			}));
		});

		//Show the Native UI
		request.show()

		//When the promise is fulfilled, show the Wallet's success view
		//In a real world scenario, the result obj would be sent
		//to the server side for processing.
		.then(function (result) {
			return result.complete('success');
		})
		.catch(function(err){
			console.error('Uh oh, bad payment response!', err.message);
		});
	};

	window.Global.startPaymentRequestDigitalMerchandise = function () {
		const methodData = [{
			supportedMethods: ['basic-card'],
			data: {
				supportedNetworks: ['visa', 'mastercard', 'amex'],
				supportedTypes: ['credit']
			}
		}];

		const subtotal = 44.00;
		const tax = 4.40;

		const details = {
			total: {
				label: 'Total due',
				amount: { currency: 'USD', value: (subtotal + tax).toFixed(2) }
			},
			displayItems: [{
				label: 'Sub-total',
				amount: { currency: 'USD', value: subtotal.toFixed(2) }
			}, {
				label: 'Sales Tax',
				amount: { currency: 'USD', value: tax.toFixed(2) }
			}]
		};

		const options = {requestPayerEmail: true};

		//constructor
		const request = new PaymentRequest(methodData, details, options);

		//Show the Native UI
		request.show()

		//When the promise is fulfilled, show the Wallet's success view
		//In a real world scenario, the result obj would be sent
		//to the server side for processing.
		.then(function (result) {
			return result.complete('success');
		})
		.catch(function(err){
			console.error('Uh oh, bad payment response!', err.message);
		});
	};

	window.Global.startPaymentRequestWithContactInfo = function () {
		const methodData = [{
			supportedMethods: ['basic-card'],
			data: {
				supportedNetworks: ['visa', 'mastercard', 'amex'],
				supportedTypes: ['credit']
			}
		}];

		const subtotal = 44.00;
		const tax = 4.40;

		const details = {
			total: {
				label: 'Total due',
				amount: { currency: 'USD', value: (subtotal + tax).toFixed(2) }
			},
			displayItems: [{
				label: 'Sub-total',
				amount: { currency: 'USD', value: subtotal.toFixed(2) }
			}, {
				label: 'Shipping',
				amount: { currency: 'USD', value: '0.00' }
			}, {
				label: 'Sales Tax',
				amount: { currency: 'USD', value: tax.toFixed(2) }
			}],
			shippingOptions: [{
				id: 'NO_RUSH',
				label: 'No-Rush Shipping',
				amount: { currency: 'USD', value: '0.00' },
				selected: true
			}, {
				id: 'STANDARD',
				label: 'Standard Shipping',
				amount: { currency: 'USD', value: '5.00' }
			}, {
				id: 'EXPEDITED',
				label: 'Two-Day Shipping',
				amount: { currency: 'USD', value: '7.00' }
			}]
		};

		const options = {
			requestPayerEmail: true,
			requestPayerPhone: true,
			requestShipping: true
		};

		//constructor
		const request = new PaymentRequest(methodData, details, options);

		//Listen to a shipping option change
		request.addEventListener('shippingoptionchange', function (changeEvent) {
			changeEvent.updateWith(new Promise(function (resolve) {
				onShippingOptionChange(request, details, subtotal, tax);
				resolve(details);
			}));
		});

		//Show the Native UI
		request.show()

		//When the promise is fulfilled, show the Wallet's success view
		//In a real world scenario, the result obj would be sent
		//to the server side for processing.
		.then(function (result) {
			return result.complete('success');
		})
		.catch(function(err){
			console.error('Uh oh, bad payment response!', err.message);
		});
	};
}());
