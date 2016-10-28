(function () {
	'use strict';

	const credAlgorithm = 'RSASSA-PKCS1-v1_5';

	const buttonLogon = document.getElementById('idButton_Logon');
	const buttonLogonWWinHello = document.getElementById('idButton_LogonWWinHello');
	const textboxAcctName = document.getElementById('idDiv_AcctName');
	const textboxPwd = document.getElementById('idInput_Pwd');
	const buttonLogonwPwd = document.getElementById('idButton_LogonWPwd');
	const buttonLogonWoRegister = document.getElementById('idButton_LogonWoRegister');
	const buttonReset = document.getElementById('idButton_Reset');
	const buttonMaybeLater = document.getElementById('idButton_MaybeLater');
	const buttonRegisterWinHello = document.getElementById('idButton_RegisterWinHello');
	const buttonSetupWinHello = document.getElementById('idButton_SetupWinHello');
	const divSetupwWinHello = document.getElementById('idDiv_SetupWindowsHello');

	const gotoHome = function() {
		location.href = 'home.html';
	};

	const gotoRegister = function() {
		location.href = 'webauthnregister.html';
	};

	const sendToServer = function () {
		/* This is where you would send data to the server.
		   Currently nothing is actually sent. */
	};

	const log = function (message) {
		console.log(message);
	};

	// Create random non-capitalized character of different length.
	const randomStr = function (length) {
		let text = '';
		const possible = 'abcdefghijklmnopqrstuvwxyz';

		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	};

	const addPasswordField = function() {
		buttonLogon.style.display = 'block';
		textboxPwd.style.display = 'block';
		buttonLogonWWinHello.style.display = 'none';
		buttonLogonwPwd.style.display = 'none';
		buttonLogonWoRegister.style.display = 'none';
	};

	const hidePasswordField = function () {
		buttonLogon.style.display = 'none';
		textboxPwd.style.display = 'none';
		buttonLogonWoRegister.style.display = 'none';
		buttonLogonWWinHello.style.display = 'block';
		buttonLogonwPwd.style.display = 'block';
	};

	const showSetupWindowsHelloDialog = function (show) {
		if (show) {
			divSetupwWinHello.style.display = 'none';
		} else {
			divSetupwWinHello.style.display = 'none';
		}
	};

	const helpSetup = function (reason) {
		// Windows Hello isn't setup, show dialog explaining how to set up
		if (reason === 'NotAllowedError') {
			showSetupWindowsHelloDialog(true);
		} else {
			/* For other special error, direct to the regular inbox without
			   bothering to set up with windows hello. */
			gotoHome();
		}

		log(`Windows Hello failed (${reason.message}).`);
	};

	const addDirectSignIn = function () {
		textboxPwd.style.display = 'block';
		buttonLogonWoRegister.style.display = 'block';
		buttonLogonwPwd.style.display = 'none';
		buttonLogonWWinHello.style.display = 'none';
	};

	const signinOrRegister = function () {
		if (navigator.authentication) {
			// If Windows Hello is supported, offer to register Windows Hello
			gotoRegister();
		} else {
			/* If the WebAuthN API is not supported, neglect the WebAuthN register
			   page and jump to the inbox page directly. */
			gotoHome();
		}
	};

	const addRandomAcctInfo = function () {
		const randomDisplayName = randomStr(7);
		const randomAcctName = (`${randomDisplayName}@${randomStr(5)}.com`);
		const randomPasswd = randomStr(10);

		/* An account identifier used by the website to control the number of
		   credentials. There is only one credential for every id. */
		const acctId = randomStr(6);

		/* Account related information is typically stored in the server
		   side. To keep the demo as simple as possible, it is stored in
		   localStorage. */
		localStorage.setItem('displayName', randomDisplayName);
		localStorage.setItem('acctName', randomAcctName);
		localStorage.setItem('acctId', acctId);
		localStorage.setItem('passwd', randomPasswd);

		textboxAcctName.setAttribute('value', randomAcctName);
		textboxPwd.setAttribute('value', randomPasswd);
	};

	const resetPage = function () {
		/* Only authenticators can delete credentials. To reset the session, we
		   use a different account name and password. LocalStorage is also cleared
		   to give a fresh start.*/
		addPasswordField();
		localStorage.clear();
		addRandomAcctInfo();
	};


	// Register user with Web AuthN API
	const createCredential = function () {
		try {
			// This information would normally come from the server
			const accountInfo = {
				rpDisplayName: 'puppycam', // Name of relying party

				// The following account information is typically stored in the server
				// side. To keep the demo as simple as possible, it is stored in
				// localStorage.

				// Name of user account in relying partying
				displayName: localStorage.getItem('displayName'),
				name: localStorage.getItem('acctName'), // Detailed name of account
				id: localStorage.getItem('acctId') // Account identifier
			};

			const cryptoParameters = [{
				type: 'ScopedCred',
				algorithm: credAlgorithm
			}];

			/* The challenge is typically a random quantity generated by the server.
			This ensures the assertions are freshly generated and not replays. */
			const attestationChallenge = 'Four score and seven years ago';

			/* In consistent with the general Javascript rule about dictionary, if a member is not needed,
			there is no need to specify it or give it a null value. For the sake of
			demonstration, rpId, allowList, and extensions are specified here. */
			const options = [{
				timeoutSeconds: 60,
				rpId: '',
				excludeList: [],
				extensions: void 0
			}];

			navigator.authentication.makeCredential(accountInfo, cryptoParameters, attestationChallenge, options)
				.then(function (credInfo) {
					// Web developers can also store the credential id on their server.
					localStorage.setItem('credentialId', credInfo.credential.id);
						// The public key here is a JSON object.
					localStorage.setItem('publicKey', credInfo.publicKey);

					gotoHome();
				})
				.catch(function(reason) {
						// Windows Hello isn't setup, show dialog explaining how to set it up
					helpSetup(reason.message);
				});
		} catch (ex) {
			log('Cannot get the display name of the site, the account name, or the account id');
			gotoHome();
		}
	};


	// Authenticate the user
	const verify = function () {
		/*The challenge is typically a random quantity generated by the server
		  This ensures that any assertions are freshly generated and not replays */
		const challenge = 'Our fathers brought forth on this continent, a new nation';

		const allowList = [{
			/* There is only one type defined in the WebAuthN spec in Sept 29th. The link to
			   this version of the spec is: http://www.w3.org/TR/2016/WD-webauthn-20160928/ */

			type: 'ScopedCred',

				/* Because the current website only supports one user to login,
				   there should only be one credential available to use. */
			id: localStorage.getItem('acctId')
		}];

		/* The options parameters are ignored in the Microsoft preliminary implementation.
		   It is created and passed in as an example of what the code may look like with the
		   current WebAuthN API. */
		const options = {
			timeoutSeconds: 60,
			rpId: void 0,
			allowList, // Specify the allowList parameter
			extensions: {}
		};

		return navigator.authentication.getAssertion(challenge, options)
			.then(function(assertion) {
				// If the assertion calls succeeds, send assertion to the server.
				sendToServer(assertion);

				// If authenticated, sign in to regular inbox.
				gotoHome();
			})
			.catch(function(err) {
				log(`getAssertion() failed: ${err}`);

				gotoHome();
			});
	};

	const featureDetect = function () {
		const credentialId = localStorage.getItem('credentialId');

		if (credentialId) {
			const acctName = localStorage.getItem('acctName');

			textboxAcctName.setAttribute('value', acctName);

			/* If the user registered to use Windows Hello before, they can logon without using
			his/her password. */
			hidePasswordField();
		} else {
			// Any error means that the user cannot sign in with WebAuthN and needs sign in with password.
			addPasswordField();
			addRandomAcctInfo();
		}
	};

	document.addEventListener('DOMContentLoaded', function() {
		/* If the password field exists, detect whether the register with Windows Hello
		   exists. If so, hide the password field and show the "Sign In with Windows  Hello" button. */
		if (textboxAcctName) {
			featureDetect();
		}

		if (buttonLogon) {
			buttonLogon.addEventListener('click', signinOrRegister);
		}

		if (buttonLogonWWinHello) {
			buttonLogonWWinHello.addEventListener('click', verify);
		}

		if (buttonLogonwPwd) {
			buttonLogonwPwd.addEventListener('click', addDirectSignIn);
		}

		if (buttonReset) {
			buttonReset.addEventListener('click', resetPage);
		}

		if (buttonMaybeLater) {
			buttonMaybeLater.addEventListener('click', gotoHome);
		}

		if (buttonRegisterWinHello) {
			buttonRegisterWinHello.addEventListener('click', createCredential);
		}

		if (buttonSetupWinHello) {
			buttonSetupWinHello.addEventListener('click', showSetupWindowsHelloDialog(false));
		}

		if (buttonLogonWoRegister) {
			buttonLogonWoRegister.addEventListener('click', gotoHome);
		}
	});
}());