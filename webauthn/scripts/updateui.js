(function() {
	'use strict';

	var credentialId = localStorage.getItem('credentialId');

	if (credentialId) {
		var acctName = localStorage.getItem('acctName');

		document.getElementById('credentialIdTextBox').setAttribute('value', acctName);

		// If the user registered to use Windows Hello before, they can logon nwithout using
		// his/her password.
		hidePasswordField();
	} else {
		// Any error means that the user cannot sign in with WebAuthN and needs to sign in with
		// password.
		addPasswordField();
		addRandomAcctInfo();
	}

	document.addEventListener('DOMContentLoaded', function() {
		document.getElementById('button-logon-with-password')
			.addEventListener('click', signInAndRegister);
		document.getElementById('button-logon-with-password-only')
			.addEventListener('click', signInWoRegister);
	});

	function signInAndRegister() {
		if (navigator.authentication) {
				// If Windows Hello is supported, offer to register Windows Hello
			window.location = 'webauthnregister.html';
		} else {
			// If the WebAuthN API is not supported, neglect the WebAuthN register
			// page and jump to the inbox page directly.
			window.location = 'inbox.html';
		}
	}

	function signInWoRegister() {
		window.location = 'inbox.html';
	}
}());

function addPasswordField() {
	document.getElementById('button-logon-with-password').style.display = 'block';
	document.getElementById('input-password').style.display = 'block';
	document.getElementById('button-logon-with-windows-hello').style.display = 'none';
	document.getElementById('button-sign-in-with-password').style.display = 'none';
}

function hidePasswordField() {
	document.getElementById('button-logon-with-password').style.display = 'none';
	document.getElementById('input-password').style.display = 'none';
	document.getElementById('button-logon-with-windows-hello').style.display = 'block';
	document.getElementById('button-sign-in-with-password').style.display = 'block';
}


function resetPage() {
	// Only authenticators can delete credentials. To reset the session, we
	// use a different accout name and password.
	addPasswordField();
	localStorage.clear();
	addRandomAcctInfo();
}

function showSetupWindowsHelloDialog(show) {
	if (show) {
		document.getElementById('SetupWindowsHello').style.display = 'block';
		document.getElementById('brandModeTD').style.display = 'none';
		document.getElementById('signInTD').style.display = 'none';
	} else {
		document.getElementById('SetupWindowsHello').style.display = 'none';
		document.getElementById('brandModeTD').style.display = 'block';
		document.getElementById('signInTD').style.display = 'block';
	}
}

function addRandomAcctInfo() {
	var randomDisplayName = randomStr(7);
	var randomAcctName = (randomDisplayName + '@' + randomStr(5) + '.com');
	var randomPasswd = randomStr(10);

	// An account identifer used by the website to control the number of
	// credentials. There is only one credential for every id.
	var acctId = randomStr(6);

	// Account related information is typically stored in the server
	// side. To keep the demo as simple as possible, it is stored in
	// localStorage.
	localStorage.setItem('displayName', randomDisplayName);
	localStorage.setItem('acctName', randomAcctName);
	localStorage.setItem('acctId', acctId);
	localStorage.setItem('passwd', randomPasswd);

	document.getElementById('credentialIdTextBox').setAttribute('value', randomAcctName);
	document.getElementById('input-password').setAttribute('value', randomPasswd);
}

function randomStr(length) {
	var text = '';
	var possible = 'abcdefghijklmnopqrstuvwxyz';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}


function addDirectSignIn() {
	document.getElementById('button-logon-with-password-only').style.display = 'block';
	document.getElementById('input-password').style.display = 'block';
	document.getElementById('button-logon-with-password').style.display = 'none';
	document.getElementById('button-logon-with-windows-hello').style.display = 'none';
	document.getElementById('button-sign-in-with-password').style.display = 'none';
}