// Register user with Web AuthN API 
function makeCredential() {
    try {

        const credAlgorithm = 'RSASSA-PKCS1-v1_5';

        // This information would normally come from the server
        var accountInfo = {
            rpDisplayName: 'puppycam', // Name of relying party

            // The following account information is typically stored in the server
            // side. To keep the demo as simple as possible, it is stored in 
            // sessionStorage. 

            // Name of user account in relying partying
            displayName: sessionStorage.getItem('displayName'), 
            name: sessionStorage.getItem('acctName'); // Detailed name of account
            id: sessionStorage.getItem('acctId'); // Account identifier
        };

        var cryptoParameters = [{
            type: 'ScopedCred',
            algorithm: credAlgorithm
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
            .then( function (credInfo) {

                // Web developers can also store the credential id on their server.
                localStorage["id"] = credInfo.credential.id;
                // The public key here is a JSON object. 
                localStorage["publicKey"] = credInfo.publicKey;

                window.location = 'inbox.html';
             })

            .catch(function(reason) {

                    // Windows Hello isn't setup, show dialog explaining how to set it up
                    setupOrSkip(reason.message);
                
            });

    } catch(ex) {

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

        var allowList = [{
                type: 'FIDO',

                // Because the current website only supports one user to login, 
                // there should only be one credential available to use. 
                id: sessionStorage.getItem('acctId')
        }];

        navigator.webauthn.getAssertion(challenge, timeout, allowList, ext).then( function(assertion) {
            // Assertion calls succeeds
            // Send assertion to the server
            sendToServer(sig);

            // If authenticated, sign in to regular inbox 
            window.location = 'inbox.html';
        }).catch( function(err) {

            log('getAssertion() failed: ' + ex);

            window.location = 'inbox.html';
        });

}

function sendToServer(msg) {
    // This is where you would send data to the server.
    // Currently nothing is actually sent.   
}

function log(message) {
    console.log(message);
}

function helpSetup(reason) {

    // Windows Hello isn't setup, show dialog explaining how to set up
    if (reason === 'NotSupportedError') {
        showSetupWindowsHelloDialog(true);
    }
    else {

        // For other special error, direct to the regular inbox without
        // bothering to set up with windows hello.
        window.location = 'inbox.html';
    }

    log('Windows Hello failed (' + reason.message + ').');
}