(function () {
	'use strict';

	const log = function (msg) {
		console.log(msg);
	};

	// Show a dialog to help explain how to set up Windows Hello
	const showSetupWindowsHelloDialog = function (bool) {
		if (bool) {
			document.getElementById('SetupWindowsHello').style.visibility = 'visible';
		} else {
			document.getElementById('SetupWindowsHello').style.visibility = 'hidden';
		}
	};

	const skipHello = function () {
		// Display error messages and direct user to the inbox page
		document.getElementById('idDiv_Something_Went_Wrong').style.visibility = 'visible';
		location.href = 'inbox.html';
	};

	const helpSetup = function (reason) {
		// Windows Hello isn't setup, show dialog explaining how to set up
		if (reason === 'NotAllowedError') {
			showSetupWindowsHelloDialog(true);
		} else {
			// For other special error, direct to the regular inbox without
			// bothering to set up with windows hello.
			skipHello();
		}

		log(`Windows Hello failed (${reason.message}).`);
	};

	const sendToServer = function () {
		// This is where you would send data to the server.
		// Currently nothing is actually sent.
	};

	const addPasswordField = function () {
		document.getElementById('button-logon-with-password').style.visibility = 'visible';
		document.getElementById('input-password').style.visibility = 'visible';
		document.getElementById('button-logon-with-windows-hello').style.visibility = 'hidden';
		document.getElementById('button-sign-in-with-password').style.visibility = 'hidden';
	};

	// Register user with Web AuthN API
	const createCredential = function () {
		try {
			const credAlgorithm = 'RSASSA-PKCS1-v1_5';

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

			// The options parameters are ignored in the Microsoft preliminary implementation.
			// It is created and passed in as an example of what the code may look like with the
			// current WebAuthN API
			const options = {
				timeoutSeconds: 60,
				rpId: void 0,
				excludeList: [],
				extensions: {}
			};

			// The challenge is typically a random quantity generated by the server.
			// This ensures the assertions are freshly generated and not replays
			const attestationChallenge = 'Four score and seven years ago';

			navigator.authentication
				.makeCredential(accountInfo, cryptoParameters, attestationChallenge, options)
				.then(function(credInfo) {
					// Web developers can also store the credential id on their server.
					localStorage.setItem('credentialId', credInfo.credential.id);
					// The public key here is a JSON object.
					localStorage.setItem('publicKey', credInfo.publicKey);

					window.location = 'inbox.html';
				})

				.catch(function(reason) {
					// Windows Hello isn't setup, show dialog explaining how to set it up
					helpSetup(reason.message);
				});
		} catch (ex) {
			helpSetup(ex);
		}
	};


	// Authenticate the user
	const verify = function () {
		// The challenge is typically a random quantity generated by the server
		// This ensures that any assertions are freshly generated and not replays
		const challenge = 'Our fathers brought forth on this continent, a new nation';

		const allowList = [{
			// There is only one type defined in the WebAuthN spec in Sept 29th. The link to
			// this version of the spec is: http://www.w3.org/TR/2016/WD-webauthn-20160928/
			type: 'ScopedCred',

				// Because the current website only supports one user to login,
				// there should only be one credential available to use.
			id: localStorage.getItem('acctId')
		}];

		// The options parameters are ignored in the Microsoft preliminary implementation.
		// It is created and passed in as an example of what the code may look like with the
		// current WebAuthN API
		const options = {
			timeoutSeconds: 60,
			rpId: void 0,
			allowList, // Specify the allowList parameter
			extensions: {}
		};

		return navigator.authentication.getAssertion(challenge, options)
			.then(function(assertion) {
				// Assertion calls succeeds
				// Send assertion to the server
				sendToServer(assertion);

			// If authenticated, sign in to regular inbox
				window.location = 'inbox.html';
			})
		.catch(function(err) {
			log(`getAssertion() failed: ${err}`);

			document.getElementById('idTd_HIP_Error_Password').style.display = 'block';
			addPasswordField();
		});
	};

	const stopCreateCredential = function () {
		location.href = 'inbox.html';
	};

	document.addEventListener('DOMContentLoaded', function() {
		document.getElementById('button-logon-with-windows-hello')
			.addEventListener('click', verify);
		document.getElementById('button-create-credential')
			.addEventListener('click', createCredential);
		document.getElementById('button-dont-create-credential')
			.addEventListener('click', stopCreateCredential);
		document.getElementById('button-show-setup-dialog')
			.addEventListener('click', showSetupWindowsHelloDialog);
	});
}());