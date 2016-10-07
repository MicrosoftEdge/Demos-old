function signInAndRegister() {
    // If Windows Hello is supported and there is no existing credential, 
    // offer to register Windows Hello
    if (window.webauthn) {
        localforage.length().then( function(numberOfKeys) {
            if (numberOfKeys == 0) {
                window.location = 'webauthnregister.html';
            } else {
                window.location = 'inbox.html';
            }
        }).catch(function(err) {
            console.log("signInAndRegister failed: " + err);
        })
    } else {

        // If the WebAuthN API is not supported, neglect the WebAuthN register 
        // page and jump to the inbox page directly. 
        window.location = 'inbox.html';
    };
}

// Register user with Web AuthN API 
function makeCredential() {
    try {
        // This information would normally come from the server
        var accountInfo = {
            rpDisplayName: 'Contoso', // Name of relying party
            displayName: 'John Doe', // Name of user account in relying partying
            name: 'johndoe@contoso.com', // Detailed name of account
            id: 'joed' // Account identifier
        };

        var cryptoParameters = [{
            type: 'FIDO',
            algorithm: 'RSASSA-PKCS1-v1_5'
        }];

        // We won't use this optional parameters
        var options = [
            {
                timeoutSeconds: "",
                excludeList: "",
                extensions: ""
            }
        ];

        // The challenge is typically a random quantity generated by the server.
        // This ensures the assertions are freshly generated and not replays
        var attestationChallenge = 'Four score and seven years ago';


        WebAuthentication.makeCredential(accountInformation, cryptoParameters, attestationChallenge, options)
            .then(function (creds) {
                 window.location = 'inbox.html';
             })

            .catch(function(reason) {

                helpSetup(reason.message);
            });

    } catch(ex) {

        helpSetup(reason.message);

            // // Windows Hello isn't setup, show dialog explaining how to set it up
            // if (reason.message === 'NotSupportedError') {
            //     showSetupWindowsHelloDialog(true);
            // }
            // log('makeCredential() failed: ' + ex);  

      }

        WebAuthentication.makeCredential(accountInfo, cryptoParameters, 
            attestationChallenge, timeout, denyList, ext)
            .then(function(creds) {

                    // If promise returns successfully, store credID locally
                    var infoInJSON = JSON.stringify({algorithm: creds.algorithm, 
                        publicKey: creds.publicKey.n})

                    localforage.setItem(creds.credential.id, infoInJSON).then(
                        function(value) {
                            
                            // Share credential information with server. 
                            // Currently nothing is actually sent. 
                            sendToServer(creds);

                            // Go to Inbox
                            window.location = 'inbox.html';
                        
                        }).catch( function(err) {

                            log(err);

                        });

            })

        .catch(function(reason) {

            helpSetup(reason.message);
        
        });
    } catch (ex) {

        helpSetup(reason.message);

    }
}

// Authenticate the user
function getAssertion() {
    try {
        // The challenge is typically a random quantity generated by the server 
        // This ensures that any assertions are freshly generated and not replays
        var challenge = 'Our fathers brought forth on this continent, a new nation';

        var timeout = {};
        var ext = {};

        localforage.keys().then(function(keys) {
            
            var allowList = [{
                type: 'FIDO',

                // Because the current website only supports one user to login, 
                // there should only be one credential available to use. 
                id: keys[0]
            }]

            return window.webauthn.getAssertion(challenge, timeout, allowList,
                ext);

        }).then( function(sig) {
            // Assertion calls succeeds
            // Send assertion to the server
            sendToServer(sig);

            // Assuming confirmation, sign in to inbox
            window.location = 'inbox.html';

        }).catch(function(err) {
            log('getAssertion() failed: ' + ex);
        });

    } catch (ex) {
        log('getAssertion() failed: ' + ex);
    }
}

function sendToServer(msg) {
    // This is where you would send data to the server.
    // Currently nothing is actually sent.   
}

function log(message) {
    console.log(message);
}

function helpSetup(reason) {
    // TODO: test this popup with someone else's brand new computer 
    // Windows Hello isn't setup, show dialog explaining how to set up
    if (reason === 'NotSupportedError') {
        showSetupWindowsHelloDialog(true);
    }
    log('Windows Hello failed (' + reason.message + ').');
}