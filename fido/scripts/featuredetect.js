(function() {

    // TODO: get rid of the use of sessionStorage here and use index.db

    // If Windows Hello registered, show this option first
    localforage.length().then( function (numberOfKeys) {
        // TODO: check if we can get rid of ==0 
        // If there are no keys stored locally, the user needs to sign in 
        // with password. 
        if (numberOfKeys == 0) {
            return addPasswordField();
        }
        else {

            // If the user hasn't registered to use Windows Hello on this 
            // site, show password options.
            return hidePasswordField();
        }
    }).catch(function (err) {
        console.log(err);
    }); 

    // if (window.sessionStorage && window.sessionStorage.getItem("credentialID")) hidePasswordField();

    // If Windows Hello not registered, show password options
    //else addPasswordField();
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
        return addPasswordField();
    }).catch(function(err) {
        console.log(err);
    });

    //windows.sessionStorage.removeItem("credentialID");

    // Clear sessionStorage to restart the session. 
    // window.sessionStorage.clear();

    // Add the password field so that the UI looks like it is restarting. 
    addPasswordField();
}