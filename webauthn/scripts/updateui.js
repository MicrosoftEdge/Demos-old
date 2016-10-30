(function() {
    // If Windows Hello registered, show this option first
    localforage.length().then( function (numberOfKeys) {
        // TODO: check if we can get rid of ==0 
        // If there are no keys stored locally, the user needs to sign in 
        // with password. 
        if (!numberOfKeys) {
            return addPasswordField();
        }
        else {

            // If the user registered to use Windows Hello before, they can logon
            // without using his/her password. 
            return hidePasswordField();
        }
    }).catch(function (err) {
        console.log("Unable to add/hide password field: " + err);
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