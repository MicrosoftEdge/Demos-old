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