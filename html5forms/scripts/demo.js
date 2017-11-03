(function () {
	'use strict';

	var checkValue = function (elt) {
		return function () {
			if (elt.validity.rangeOverflow) {
				elt.setCustomValidity('Please call the bakery for orders over 100 servings.');
			} else {
				elt.setCustomValidity('');
			}
		};
	};

	var checkValue2 = function (elt, msg) {
		return function () {
			if (!elt.checkValidity()) {
				msg.style.visibility = 'visible';
			} else {
				msg.style.visibility = 'hidden';
			}
		};
	};

	var displayErrorExperience = function (form) {
		return function () {
			var formValidity = true;
			for (var i = 0; i < form.elements.length; i++) {
				if (!form.elements[i].checkValidity()) {
					formValidity = false;
				}
			}
			if (!formValidity) {

				var message = 'There was an error trying to submit this form:';
				for (var i = 0; i < form.elements.length; i++) {
					if (!form.elements[i].checkValidity()) {
						switch (form.elements[i].type) {
							case 'email':
								message += '\n Email field must contain a vaid email address';
								break;
							case 'tel':
								message += '\n Telephone filed must contain a phone number in the form (xxx) xxx-xxxx';
								break;
						}
					}
				}
			}
		};
	};

	var formNoSubmit = function (e) {
		this.className = 'success';
		e.preventDefault();
	};

	var formReset = function () {
		this.form.className = '';
	};

	var changeSubmitBehavior = function () {
		var forms = document.querySelectorAll('form');
		for (var i = 0; i < forms.length; i++) {
			forms[i].addEventListener('submit', formNoSubmit, false);
		}

		var inputs = document.querySelectorAll('form input');
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('focus', formReset, false);
		}
	};

	var activateTab = function (num) {
		var divs = document.querySelectorAll('#demo-details div');
		for (var i = 0; i < divs.length; i++) {
			if (i === (num - 1)) {
				divs[i].className = 'active';
			} else {
				divs[i].className = '';
			}
		}

		var lis = document.querySelectorAll('#tabmenu a');
		for (var i = 0; i < lis.length; i++) {
			if (i === (num - 1)) {
				lis[i].className = 'active';
			} else {
				lis[i].className = '';
			}
		}
	};

	var customReset = function () {
		var cakeForm = document.getElementById('cakeForm');
		document.getElementById('cake1').value = '';
		document.getElementById('cake2').value = '';
		document.getElementById('cake3').value = '';
		document.getElementById('cake4').value = '';
		document.getElementById('cake5').value = '';
		document.getElementById('cake6').value = '';
		document.getElementById('cake7').value = '';
		document.getElementById('cake8').value = '';
		checkValue(document.getElementById('cake8'));
		document.getElementById('cake9').value = '';
		document.getElementById('cake12').value = '';
		document.getElementById('cake13').value = '';
		cakeForm.reset();
	};

	var submitEmpty = function () {
		customReset();
		document.getElementById('sub').click();
	};

	var invalidEmail = function () {
		customReset();

		document.getElementById('cake1').value = 'John Doe';
		document.getElementById('cake2').value = '1 Microsoft Way';
		document.getElementById('cake3').value = 'Redmond';
		document.getElementById('cake4').value = 'WA';
		document.getElementById('cake5').value = '98052';
		document.getElementById('cake6').value = 'john  @doe.com';

		document.getElementById('sub').click();
	};

	var invalidZip = function () {
		customReset();

		document.getElementById('cake1').value = 'John Doe';
		document.getElementById('cake2').value = '1 Microsoft Way';
		document.getElementById('cake3').value = 'Redmond';
		document.getElementById('cake4').value = 'WA';
		document.getElementById('cake5').value = '952';

		document.getElementById('sub').click();
	};

	var invalidServings = function () {
		customReset();
		document.getElementById('cake1').value = 'John Doe';
		document.getElementById('cake2').value = '1 Microsoft Way';
		document.getElementById('cake3').value = 'Redmond';
		document.getElementById('cake4').value = 'WA';
		document.getElementById('cake5').value = '98052';
		document.getElementById('cake6').value = 'john.doe@microsoft.com';
		document.getElementById('cake7').value = '425-555-5555';
		document.getElementById('cake8').value = 120;
		checkValue(document.getElementById('cake8'));

		document.getElementById('sub').click();
	};

	var invalidLayers = function () {
		customReset();

		document.getElementById('cake1').value = 'John Doe';
		document.getElementById('cake2').value = '1 Microsoft Way';
		document.getElementById('cake3').value = 'Redmond';
		document.getElementById('cake4').value = 'WA';
		document.getElementById('cake5').value = '98052';
		document.getElementById('cake6').value = 'john.doe@microsoft.com';
		document.getElementById('cake7').value = '425-555-5555';
		document.getElementById('cake8').value = 30;
		checkValue(document.getElementById('cake8'));

		document.getElementById('cake9').value = 0;

		document.getElementById('sub').click();
	};

	var attachEvents = function () {
		document.getElementById('empty-form').addEventListener('click', submitEmpty, false);
		document.getElementById('invalid-email').addEventListener('click', invalidEmail, false);
		document.getElementById('invalid-zip').addEventListener('click', invalidZip, false);
		document.getElementById('invalid-servings').addEventListener('click', invalidServings, false);
		document.getElementById('invalid-layers').addEventListener('click', invalidLayers, false);

		var cake8 = document.getElementById('cake8');
		cake8.addEventListener('change', checkValue(cake8), false);

		var tabs = document.querySelectorAll('#tabmenu a');
		for (var i = 0, l = tabs.length; i < l; i++) {
			var tab = tabs[i];
			tab.addEventListener('click', (function (index) {
				return function (evt) {
					evt.preventDefault();
					tabs[index].blur();
					activateTab(index + 1);
				};
			}(i)), false);
		}

		var i1 = document.getElementById('i1');
		i1.addEventListener('change', checkValue(i1), false);

		var e17 = document.getElementById('e17');
		e17.addEventListener('change', checkValue2(e17, document.getElementById('errorMessage')), false);
		e17.addEventListener('invalid', function () {
			return false;
		}, false);

		var e18 = document.getElementById('e18');
		e18.addEventListener('change', checkValue2(e18, document.getElementById('errorMessage2')), false);
		e18.addEventListener('invalid', function () {
			return false;
		}, false);

		document.getElementById('submit').addEventListener('click', displayErrorExperience(document.getElementById('form')), false);
	};

	var init = function () {
		checkValue(document.getElementById('i1'));
		changeSubmitBehavior();
	};

	attachEvents();
	init();
}());
