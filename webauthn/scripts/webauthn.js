"use strict";

// Editor's draft of spec at https://w3c.github.io/webauthn/#api

// The polyfill works on any machine carrying Web Authentication API and PCs 
// that installed Windows 8.1 and above.


// TODO: Use https instead of http 

// TODO: Generate random unique strings to reset session 

// TODO: Change how it detects whether a credential is available or not. 

// DONE: Throw NotAllowedError DOMException if anything goes wrong in
// makeCredential and getAssertion 

// If Web Authenticaion API is available on the browser, use the API. Otherwise,
// use the polyfill. 
navigator.authentication = navigator.authentication || (function () {


	const webauthnDB = (function() {

		const WEBAUTHN_DB_VERSION = 1;
		const WEBAUTHN_DB_NAME = "_webauthn";
		const WEBAUTHN_ID_TABLE = "identities";

		var db = null;
		var initPromise = null;

		function initDB() {

     /* to remove database, use window.indexedDB.deleteDatabase('_webauthn'); */
			return new Promise(function(resolve,reject) {

				var req = indexedDB.open(WEBAUTHN_DB_NAME,WEBAUTHN_DB_VERSION);
				req.onupgradeneeded = function() {

					// new database - set up store
					db = req.result;
					var store = db.createObjectStore(WEBAUTHN_ID_TABLE, { keyPath: "id"});

				};

				req.onsuccess = function() {
					db = req.result;
					resolve();
				};

				req.onerror = function(e) {
					reject(e);
				};
			});
		}

		function store(id,data) {
			if(!initPromise) { initPromise = initDB(); }
			return initPromise.then(function() { doStore(id,data) });
		}

		function doStore(id,data) {

			if(!db) throw "DB not initialised";
			return new Promise(function(resolve,reject) {

				var tx = db.transaction(WEBAUTHN_ID_TABLE,"readwrite");
				var store = tx.objectStore(WEBAUTHN_ID_TABLE);
				store.put({id:id,data:data});

				tx.oncomplete = function() {
					resolve();
				}

				tx.onerror = function(e) {
					reject(e);				
				};

			});

		}

		function getAll() {
			if(!initPromise) { initPromise = initDB(); }
			return initPromise.then(doGetAll);
		}


		function doGetAll() {

			if(!db) throw "DB not initialised";

			return new Promise(function(resolve,reject) {

				var tx = db.transaction(WEBAUTHN_ID_TABLE,"readonly");
				var store = tx.objectStore(WEBAUTHN_ID_TABLE);
				var req = store.openCursor();
				var res = [];

				req.onsuccess = function() {

					var cur = req.result;
					if(cur) {
						res.push({id:cur.value.id,data:cur.value.data});
						cur.continue();
					} else {
						resolve(res);
					}
				}

				req.onerror = function(e) {
					reject(e);
				};

			});

		}

		return {
			store: store,
			getAll: getAll
		};

	}());



    function makeCredential(accountInfo, cryptoParams, attestChallenge, options) {

    	try {

    		// Need to know the display name of the relying party, the display name
    		// of the user, and the user id to create a credential. For every user
    		// id, there is one credential stored by the authenticator. 
			var acct = {rpDisplayName: accountInfo.rpDisplayName, 
				userDisplayName: accountInfo.displayName, userId : accountInfo.id};
			var params = [];
			var i;


			if (accountInfo.name) { acct.accountName = accountInfo.name; }
			if (accountInfo.imageUri) { acct.accountImageUri = accountInfo.imageUri; }


			for ( i = 0; i < cryptoParams.length; i++ ) {
				if ( cryptoParams[i].type === 'ScopedCred' ) {
					params[i] = { type: 'FIDO_2_0', algorithm: cryptoParams[i].algorithm };
				} else {
					params[i] = cryptoParams[i];
				}

			}

	        return msCredentials.makeCredential(acct, params).then(function (cred) {

				if (cred.type === "FIDO_2_0") {
					var result = Object.freeze({
						credential: {type: "ScopedCred", id: cred.id},
						publicKey: JSON.parse(cred.publicKey),
						attestation: cred.attestation
					});

					return webauthnDB.store(result.credential.id,accountInfo).then(function() { 
						return result; 
					});

				} else {
					return cred;
				}
			});
    	}
    	catch (err) {

    		throw new DOMException('NotAllowedError');

    	}

    	
    }



    function getCredList(allowlist) {

		var credList = [];

    	if(allowlist) {

    		return new Promise(function(resolve,reject) {
    			allowlist.forEach(function(item) {
					if (item.type === 'ScopedCred' ) {
						credList.push({ type: 'FIDO_2_0', id: item.id });
					} else {
						credList.push(item);
					}

    			});
    			resolve(credList);
			});
    	} else {
    		return webauthnDB.getAll().then(function(list) {
    			list.forEach(item => credList.push({ type: 'FIDO_2_0', id: item.id }));
    			return credList;
    		});
    	}
    }



    function getAssertion(challenge, options) {

    	try {
    		
    		var allowlist = options ? options.allowList : undefined;

			return getCredList(allowlist).then(function(credList) {

				var filter = { accept: credList }; 
				var sigParams = undefined;

				if (options && options.extensions && options.extensions["webauthn_txAuthSimple"]) { 
					sigParams = { userPrompt: options.extensions["webauthn_txAuthSimple"] }; 
				}

		        return msCredentials.getAssertion(challenge, filter, sigParams).then(function (sig) {

					if (sig.type === "FIDO_2_0"){

						return Object.freeze({

							credential: {type: "ScopedCred", id: sig.id},
							clientData: sig.signature.clientData,
							authenticatorData: sig.signature.authnrData,
							signature: sig.signature.signature

						});

					} else {
						return sig;
					}
				});
			});    		
    	}

		catch (e) {

			throw new DOMException('NotAllowedError');

		}
    }


    return {
        makeCredential: makeCredential,
        getAssertion: getAssertion
    };

}());