(function () {
	'use strict';

	const hidePasswordField = function () {
		document.getElementById('button-logon-with-password').style.display = 'none';
		document.getElementById('input-password').style.display = 'none';
		document.getElementById('button-logon-with-windows-hello').style.display = 'block';
		document.getElementById('button-sign-in-with-password').style.display = 'block';
	};

	const addPasswordField = function () {
		document.getElementById('button-logon-with-password').style.display = 'block';
		document.getElementById('input-password').style.display = 'block';
		document.getElementById('button-logon-with-windows-hello').style.display = 'none';
		document.getElementById('button-sign-in-with-password').style.display = 'none';
	};

	const randomStr = function (length) {
		let text = '';
		const possible = 'abcdefghijklmnopqrstuvwxyz';

		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	};

	const addRandomAcctInfo = function () {
		const randomDisplayName = randomStr(7);
		const randomAcctName = (`${randomDisplayName}@${randomStr(5)}.com`);
		const randomPasswd = randomStr(10);

			// An account identifer used by the website to control the number of
			// credentials. There is only one credential for every id.
		const acctId = randomStr(6);

			// Account related information is typically stored in the server
			// side. To keep the demo as simple as possible, it is stored in
			// localStorage.
		localStorage.setItem('displayName', randomDisplayName);
		localStorage.setItem('acctName', randomAcctName);
		localStorage.setItem('acctId', acctId);
		localStorage.setItem('passwd', randomPasswd);

		document.getElementById('credentialIdTextBox').setAttribute('value', randomAcctName);
		document.getElementById('input-password').setAttribute('value', randomPasswd);
	};

	const detectCredential = function () {
		const credentialId = localStorage.getItem('credentialId');

		if (credentialId) {
			const acctName = localStorage.getItem('acctName');

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
	};

	const signInAndRegister = function () {
		if (navigator.authentication) {
					// If Windows Hello is supported, offer to register Windows Hello
			location.href = 'webauthnregister.html';
		} else {
				// If the WebAuthN API is not supported, neglect the WebAuthN register
				// page and jump to the inbox page directly.
			location.href = 'inbox.html';
		}
	};

	const signInWoRegister = function () {
		location.href = 'inbox.html';
	};

	const resetPage = function () {
		// Only authenticators can delete credentials. To reset the session, we
		// use a different accout name and password.
		addPasswordField();
		localStorage.clear();
		addRandomAcctInfo();
	};


	const addDirectSignIn = function () {
		document.getElementById('button-logon-with-password-only').style.display = 'block';
		document.getElementById('input-password').style.display = 'block';
		document.getElementById('button-logon-with-password').style.display = 'none';
		document.getElementById('button-logon-with-windows-hello').style.display = 'none';
		document.getElementById('button-sign-in-with-password').style.display = 'none';
	};

	document.addEventListener('DOMContentLoaded', function() {
		detectCredential();
		document.getElementById('button-logon-with-password')
			.addEventListener('click', signInAndRegister);
		document.getElementById('button-logon-with-password-only')
			.addEventListener('click', signInWoRegister);
		document.getElementById('button-sign-in-with-password')
			.addEventListener('click', addDirectSignIn);
		document.getElementById('link-reset-session')
			.addEventListener('click', resetPage);
	});
}());

