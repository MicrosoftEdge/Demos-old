// This file implements the current FIDO API on top of the Microsoft Edge preliminary implementation.
// This implementation inherits its limitations on parameter values from the Edge implementation.
// Initial version: Vijay Bharadwaj, February 2016

// Notes on limitations:
// All of this only works if the user has created a PIN (and optionally Hello gestures) for themselves in Settings->Accounts->Sign-in options,
// as that's what creates the container into which these keys will go
// Keys will be held in hardware if the machine has a sufficiently performant TPM, otherwise in software
// makeCredential:
//    - timeout is ignored
//    - blacklist is ignored
//    - all extensions are ignored
//    - current implementation does not return attestation info
// getAssertion:
//    - timeout is ignored
//    - Whitelist is required in order to get an assertion (this means we can only do U2F-style scenarios, not "typeless" auth where the user is prompted to pick an identity)
//    - all extensions are ignored except fido.txauth.simple
//    - signature should be spec compliant if no extension used (signature counter is always zero)
//    - if txauth.simple extension used, clientData contains an extra field called userPrompt which contains the prompt and authenticatorData still says no extensions

'use strict';

var webauthn = (function () {

    function msMakeCredential(accountInfo, cryptoParams, attestChallenge, timeout, blacklist, ext) {
		var acct = {rpDisplayName: accountInfo.rpDisplayName, userDisplayName: accountInfo.displayName};
		var params = [];
		var i;
		
		if (accountInfo.name) { acct.accountName = accountInfo.name; }
		if (accountInfo.id) { acct.userId = accountInfo.id; }
		if (accountInfo.imageUri) { acct.accountImageUri = accountInfo.imageUri; }

		for ( i = 0; i < cryptoParams.length; i++ ) {
			if ( cryptoParams[i].type === 'FIDO' ) {
				params[i] = { type: 'FIDO_2_0', algorithm: cryptoParams[i].algorithm };
			} else {
				params[i] = cryptoParams[i];
			}
		}
        return msCredentials.makeCredential(acct, params, attestChallenge).then(function (cred) {
			if (cred.type === 'FIDO_2_0'){
				return Object.freeze({
					credential: {type: 'FIDO', id: cred.id},
					algorithm: cred.algorithm,
					publicKey: JSON.parse(cred.publicKey),
					attestation: cred.attestation
				});
			} else {
				return cred;
			}
		});
    }

    function msGetAssertion(challenge, timeout, whitelist, ext) {
		var filter = undefined;
		var credList = [];
		var sigParams = undefined;
		var j;
        
		if (whitelist) { 
			for ( j = 0; j < whitelist.length; j++ ) {
				if ( whitelist[j].type === 'FIDO' ) {
					credList[j] = { type: 'FIDO_2_0', id: whitelist[j].id };
				} else {
					credList[j] = whitelist[j];
				}
			}
			filter = { accept: credList }; 
		}
		if (ext['fido.txauth.simple']) { sigParams = { userPrompt: ext['fido.txauth.simple'] }; }

        return msCredentials.getAssertion(challenge, filter, sigParams).then(function (sig) {
			if (sig.type === 'FIDO_2_0'){
				return Object.freeze({
					credential: {type: 'FIDO', id: sig.id},
					clientData: sig.signature.clientData,
					authenticatorData: sig.signature.authnrData,
					signature: sig.signature.signature
				});
			} else {
				return sig;
			}
		});
    }

    return {
        makeCredential: msMakeCredential,
        getAssertion: msGetAssertion
    };
}());
