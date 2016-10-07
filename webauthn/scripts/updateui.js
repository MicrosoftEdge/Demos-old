(function() {
    // If Windows Hello registered, show this option first

    // localforage.length().then( function (numberOfKeys) {
    //     // TODO: check if we can get rid of ==0 
    //     // If there are no keys stored locally, the user needs to sign in 
    //     // with password. 
    //     if (!numberOfKeys) {
    //         return addPasswordField();
    //     }
    //     else {

    //         // If the user registered to use Windows Hello before, they can logon
    //         // without using his/her password. 
    //         return hidePasswordField();
    //     }
    // }).catch(function (err) {
    //     console.log("Unable to add/hide password field: " + err);
    // }); 

    // The challenge typically comes from the server. 
    challenge = "chanllenge-string";
    navigator.authentication.getAssertion(challenge).then( function(assertion) {

        return hidePasswordField();

    }).catch( function(err) {

        // Any error means that the user cannot sign in with WebAuthN and needs
        // sign in with password. 
        return addPasswordField();

        // if (err === DOMException('NotAllowedError')) {

        //     return addPasswordField();
        // } 
        // else {

        // }
    });

})();

function addPasswordField() {
    document.getElementById("button-logon-with-password").style.display = "block";
    document.getElementById("input-password").style.display = "block";
    document.getElementById("button-logon-with-windows-hello").style.display = "none";
    document.getElementById("button-sign-in-with-password").style.display = "none";
}

function hidePasswordField() {
    document.getElementById("button-logon-with-password").style.display = "none";
    document.getElementById("input-password").style.display = "none";
    document.getElementById("button-logon-with-windows-hello").style.display = "block";
    document.getElementById("button-sign-in-with-password").style.display = "block";
}

function resetPage() {

    // Clear all entires of the credentials database to restart the 
    // session.
    localforage.clear().then( function() {

        // Add the password field to reset the UI to its original state 
        return addPasswordField();

    }).catch(function(err) {
        console.log("Page was not reset: " + err);
    });

}

function showSetupWindowsHelloDialog(show) {
    if (show) {
        document.getElementById("SetupWindowsHello").style.display = "block";
        document.getElementById("brandModeTD").style.display = "none";
        document.getElementById("signInTD").style.display = "none";
    } else {
        document.getElementById("SetupWindowsHello").style.display = "none";
        document.getElementById("brandModeTD").style.display = "block";
        document.getElementById("signInTD").style.display = "block";
    }
}

function randomAcctName() {
    return (randomStr(7) + "@" + randomStr(5) + ".com")
}

function randomPasswd() {
    return randomStr(10);
}

function randomStr(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}