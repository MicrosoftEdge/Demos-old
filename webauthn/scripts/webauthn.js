// This file implements a polyfill that maps current Web Authentication API on
// top of the Microsoft Edge preliminary implementation.

// The polyfill is up-to-date with the Editor's Draft of Sept 29th. Please refer
// to this link for the spec: https://w3c.github.io/webauthn

// This implementation inherits its limitations on parameter values from the
// Edge implementation.

// Notes on limitations:
// The polyfill only works if the user has created a PIN (and optionally Hello
// gestures) for themselves in Settings->Accounts->Sign-in options. Otherwise,
// a DOMException error will be thrown.
//
// makeCredential:
//    - timeout is ignored
//    - all extensions are ignored
//    - current implementation does not return attestation info
// getAssertion:
//    - timeout is ignored
//    - all extensions are ignored except fido.txauth.simple
//    - signature should be spec compliant if no extension used (signature
//      counter is always zero)


// Editor's draft of spec at https://w3c.github.io/webauthn/#api

// The polyfill works on any machine carrying Web Authentication API and PCs
// that installed Windows 8.1 and above.

// If Web Authenticaion API is available on the browser, use the API. Otherwise,
// use the polyfill.

/* global msCredentials */
navigator.authentication = navigator.authentication || (function () {
	'use strict';

	var webauthnDB = (function() {
		var WEBAUTHN_DB_VERSION = 1;
		var WEBAUTHN_DB_NAME = '_webauthn';
		var WEBAUTHN_ID_TABLE = 'identities';

		var db = null;
		var initPromise = null;

		var initDB = function initDB() {
	 /* to remove database, use window.indexedDB.deleteDatabase('_webauthn'); */
			return new Promise(function(resolve, reject) {
				var req = indexedDB.open(WEBAUTHN_DB_NAME, WEBAUTHN_DB_VERSION);
				req.onupgradeneeded = function() {
					// new database - set up store
					db = req.result;
					var objectStore = db.createObjectStore(WEBAUTHN_ID_TABLE, { keyPath: 'id'});
				};

				req.onsuccess = function() {
					db = req.result;
					resolve();
				};

				req.onerror = function(e) {
					reject(e);
				};
			});
		};

		var doStore = function doStore(id, data) {
			if (!db) {
				throw new Error('DB not initialised');
			}
			return new Promise(function(resolve, reject) {
				var tx = db.transaction(WEBAUTHN_ID_TABLE, 'readwrite');
				var store = tx.objectStore(WEBAUTHN_ID_TABLE);
				store.put({id: id, data: data});

				tx.oncomplete = function() {
					resolve();
				};

				tx.onerror = function(e) {
					reject(e);
				};
			});
		};

		var store = function store(id, data) {
			if (!initPromise) {
				initPromise = initDB();
			}
			return initPromise.then(function() {
				return doStore(id, data);
			});
		};

		var getAll = function getAll() {
			if (!initPromise) {
				initPromise = initDB();
			}
			return initPromise.then(doGetAll);
		};


		var doGetAll = function doGetAll() {
			if (!db) {
				throw new Error('DB not initialised');
			}

			return new Promise(function(resolve, reject) {
				var tx = db.transaction(WEBAUTHN_ID_TABLE, 'readonly');
				var req = tx.objectStore(WEBAUTHN_ID_TABLE).openCursor();
				var res = [];

				req.onsuccess = function() {
					var cur = req.result;
					if (cur) {
						res.push({id: cur.value.id, data: cur.value.data});
						cur.continue();
					} else {
						resolve(res);
					}
				};

				req.onerror = function(e) {
					reject(e);
				};
			});
		};

		return {
			store: store,
			getAll: getAll
		};
	}());


	var makeCredential = function makeCredential(accountInfo, cryptoParams, attestChallenge, options) {
		try {
			// Need to know the display name of the relying party, the display name
			// of the user, and the user id to create a credential. For every user
			// id, there is one credential stored by the authenticator.
			var acct = {rpDisplayName: accountInfo.rpDisplayName,
				userDisplayName: accountInfo.displayName, userId: accountInfo.id};
			var params = [];
			var i;


			if (accountInfo.name) {
				acct.accountName = accountInfo.name;
			}
			if (accountInfo.imageUri) {
				acct.accountImageUri = accountInfo.imageUri;
			}


			for (i = 0; i < cryptoParams.length; i++) {
				// The type identifier is changed from 'FIDO_2_0' to 'ScopedCred'
				if (cryptoParams[i].type === 'ScopedCred') {
					params[i] = { type: 'FIDO_2_0', algorithm: cryptoParams[i].algorithm };
				} else {
					params[i] = cryptoParams[i];
				}
			}

			return msCredentials.makeCredential(acct, params).then(function (cred) {
				if (cred.type === 'FIDO_2_0') {
					// The returned credential should be immutable, aka freezed.
					var result = Object.freeze({
						credential: {type: 'ScopedCred', id: cred.id},
						publicKey: JSON.parse(cred.publicKey),
						attestation: cred.attestation
					});

					return webauthnDB.store(result.credential.id, accountInfo).then(function() {
						return result;
					});
				}

				return cred;
			}).catch(function(err) {
				throw new DOMException('NotAllowedError');
			});
		} catch (err) {
			throw new DOMException('NotAllowedError');
		}
	};


	var getCredList = function getCredList(allowlist) {
		// According to the spec, if allowList is supplied, the credentialList
		// comees from the allowList; otherwise the credentialList is comes
		// from searching all previously stored valid credentials
		if (allowlist) {
			return Promise.resolve(allowlist.map(function(descriptor) {
				if (descriptor.type === 'ScopedCred') {
					return { type: 'FIDO_2_0', id: descriptor.id};
				}
				return descriptor;
			}));
		}
		webauthnDB.getAll.then(function(list) {
			return Promise.resolve(list.map(function(descriptor) {
				return { type: 'FIDO_2_0', id: descriptor.id};
			}));
		}).then(function(credList) {
			return credList;
		}).catch(function(err) {
			console.log('Credential lists cannot be retrieved: ' + err);
		});
	};


	var getAssertion = function getAssertion(challenge, options) {
		try {
			var allowlist = options ? options.allowList : undefined;

			return getCredList(allowlist).then(function(credList) {
				var filter = { accept: credList };
				var sigParams;

				if (options && options.extensions && options.extensions.webauthn_txAuthSimple) {
					sigParams = { userPrompt: options.extensions.webauthn_txAuthSimple };
				}

				return msCredentials.getAssertion(challenge, filter, sigParams);
			}).then(function(sig) {
				if (sig.type === 'FIDO_2_0') {
					return Promise.resolve(Object.freeze({

						credential: {type: 'ScopedCred', id: sig.id},
						clientData: sig.signature.clientData,
						authenticatorData: sig.signature.authnrData,
						signature: sig.signature.signature

					}));
				}

				return Promise.resolve(sig);
			}).catch(function(err) {
				throw new Error('NotAllowedError');
			});
		} catch (e) {
			throw new Error('NotAllowedError');
		}
	};


	return {
		makeCredential: makeCredential,
		getAssertion: getAssertion
	};
}());