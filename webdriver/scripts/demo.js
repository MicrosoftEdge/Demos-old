(function(){
    "use strict";
    
    var commands;
    var sessionId;
    var elementId;
    
    window.onload = function setup() {
        setupCommands();
        setupHttpMethods();
        setupEventListeners();
        loadResponseCodeMap();
    
        // Defaults to newSession command
        document.getElementById("commands-select-newSession").selected = true;
        updateCommand();
    }
    
    /* Setup Commands */
    function setupCommands() {
        loadCommands();
        var s = document.getElementById("commands-select");
        for (var j = 0; j < commands.length; j++) {
            var o = document.createElement("OPTION");
            o.value = commands[j].commandName;
            o.id = "commands-select-" + commands[j].commandName;
            o.innerHTML = commands[j].commandName;
    
            s.appendChild(o);
        }
    }
    
    function loadCommands() {
        commands = [];
        commands.push({ commandName: "click", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/click", requestBody: "" });
        commands.push({ commandName: "executeScript", method: "POST", path: "/session/SESSION_ID/execute", requestBody: "{\"script\": \"return arguments[0].second;\",\"args\": [{\"first\":\"1st\", \"second\":\"2nd\", \"third\":\"3rd\"}]}" });
        commands.push({ commandName: "findElement", method: "POST", path: "/session/SESSION_ID/element", requestBody: "{\"using\": \"id\",\"value\": \"clickAnchorElement\"}" });
        commands.push({ commandName: "get", method: "POST", path: "/session/SESSION_ID/url", requestBody: "{\"url\":\"http://www.bing.com\"}" });
        commands.push({ commandName: "getElementAttribute", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/attribute/:name", requestBody: "" });
        commands.push({ commandName: "getElementScreenshot", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/screenshot", requestBody: "" });
        commands.push({ commandName: "getElementTagName", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/name", requestBody: "" });
        commands.push({ commandName: "getElementText", method: "GET", path: "/session/SESSION_ID/element/ELEMENT_ID/text", requestBody: "" });
        commands.push({ commandName: "getTitle", method: "GET", path: "/session/SESSION_ID/title", requestBody: "" });
        commands.push({ commandName: "newSession", method: "POST", path: "/session", requestBody: "{\"desiredCapabilities\":{ \"browserName\":\"<browserName>\", \"browserVersion\":\"<browserVersion>\", \"platformName\":\"Windows NT\", \"platformVersion\":\"10\"},\"requiredCapabilities\":{}}" });
        commands.push({ commandName: "quit", method: "DELETE", path: "/session/SESSION_ID", requestBody: "" });
        commands.push({ commandName: "screenshot", method: "GET", path: "/session/SESSION_ID/screenshot", requestBody: "" });
        commands.push({ commandName: "sendKeys", method: "POST", path: "/session/SESSION_ID/element/ELEMENT_ID/value", requestBody: "{\"value\": [\"a\", \"b\", \"c\"]}" });
    }
    
    /* Setup HTTP Methods */
    function setupHttpMethods() {
        var methods = ["GET", "POST", "DELETE"];
    
        var s = document.getElementById("methods-select");
        for (var j = 0; j < methods.length; j++) {
            var o = document.createElement("OPTION");
            o.value = methods[j];
            o.innerHTML = methods[j];
            s.appendChild(o);
            o.selected = true;
        }
    }
    
    /* Setup Event Listeners */
    var lastCommandSent;
    
    function setupEventListeners() {
        addSendRequestListener();
        addCommandListener();
        addClearLogListener();
        addClearAllListener();
    }
    
    function addSendRequestListener() {
        var sendRequestElement = document.getElementById("send-request");
        
        sendRequestElement.addEventListener("click", sendRequest);
    }
    
    function addCommandListener() {
        var updateCommandElement = document.getElementById("commands-select");
        
        updateCommandElement.addEventListener("change", updateCommand);
    }
    
    function addClearLogListener() {
        var clearLogElement = document.getElementById("clear-log");
        
        clearLogElement.addEventListener("click", clearLog);
    }
    
    function addClearAllListener() {
        var clearAllElement = document.getElementById("clear-all");
        
        clearAllElement.addEventListener("click", clearAll);
    }
    
    /* Load Response Code Map */
    var responseCodeMap = new Map();
    
    function loadResponseCodeMap() {
        responseCodeMap.set(-1, "Invalid");
        responseCodeMap.set(0, "Success");
        responseCodeMap.set(6, "NoSuchDriver");
        responseCodeMap.set(7, "NoSuchElement");
        responseCodeMap.set(8, "NoSuchFrame");
        responseCodeMap.set(9, "UnknownCommand");
        responseCodeMap.set(10, "StaleElementReference");
        responseCodeMap.set(11, "ElementNotVisible");
        responseCodeMap.set(12, "InvalidElementState");
        responseCodeMap.set(13, "UnknownError");
        responseCodeMap.set(15, "ElementIsNotSelectable");
        responseCodeMap.set(17, "JavaScriptError");
        responseCodeMap.set(19, "XPathLookupError");
        responseCodeMap.set(21, "Timeout");
        responseCodeMap.set(23, "NoSuchWindow");
        responseCodeMap.set(24, "InvalidCookieDomain");
        responseCodeMap.set(25, "UnableToSetCookie");
        responseCodeMap.set(26, "UnexpectedAlertOpen");
        responseCodeMap.set(27, "NoAlertOpenError");
        responseCodeMap.set(28, "ScriptTimeout");
        responseCodeMap.set(29, "InvalidElementCoordinates");
        responseCodeMap.set(30, "IMENotAvailable");
        responseCodeMap.set(31, "IMEEngineActivationFailed");
        responseCodeMap.set(32, "InvalidSelector");
        responseCodeMap.set(33, "SessionNotCreatedException");
        responseCodeMap.set(34, "MoveTargetOutOfBounds");
        responseCodeMap.set(40, "UnsupportedOperation");
        responseCodeMap.set(41, "UnableToTakeScreenshot");
        responseCodeMap.set(42, "NotImplemented");
        responseCodeMap.set(43, "InvalidArgument");
    }
    
    /* Helper Functions */
    function clearLog() {
        document.getElementById("log-contents").innerHTML = "";
    }
    
    function clearAll() {
        sessionId = "";
        elementId = "";
        clearLog();
    }
    
    function updateCommand() {
        var s = document.getElementById("commands-select");
    
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].commandName == s.options[s.selectedIndex].value) {
                document.getElementById("methods-select").value = commands[i].method;
                document.getElementById("path").value = checkForIds(commands[i].path);
    
                if (commands[i].requestBody != "") {
                    try {
                        var jsonObj = JSON.parse(commands[i].requestBody);
                        var jsonString = JSON.stringify(jsonObj, null, 4);
                        document.getElementById("content-area").value = checkForIds(jsonString);
                    }
                    catch (err) {
                        logError(err.message);
                    }
                }
                else {
                    document.getElementById("content-area").value = "";
                }
                break;
            }
        }
    }
    
    function sendRequest() {
        var path = document.getElementById("path").value;
        var host = "http://localhost";
        var port = "17556";
        var url = host + ":" + port + path;
        var requestBody = document.getElementById("content-area").value;
        var method = document.getElementById("methods-select").value;
        logRequest(method, url, requestBody);
    
        lastCommandSent = document.getElementById("commands-select").value;
    
        var xmlhttp = new XMLHttpRequest();
    
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                processResponse(xmlhttp);
            }
        }
    
        xmlhttp.open(method, url, true);
        if (requestBody == "") {
            xmlhttp.send();
        }
        else {
            xmlhttp.send(requestBody);
        }
    }
    
    function logRequest(method, url, requestBody) {
        var lRequest = "<div class=\"command-info\">" + "<p>" + getTimeString() + "- Request " + method + " " + url + "</p>";
        if (requestBody != "")
        {
            try
            {
                var jsonObj = JSON.parse(requestBody);
                var jsonString = JSON.stringify(jsonObj, null, 4);
                lRequest += "<pre>" + jsonString + "</pre>";
            }
            catch (err)
            {
                logError(err.message);
            }
        }
        lRequest += "</div>";
    
        var d = document.createElement("div");
        d.class = "loq-request";
        d.innerHTML = lRequest;
    
        var l = document.getElementById("log-contents");
        l.insertBefore(d, l.firstChild);
    }
    
    function processResponse(xmlhttp) {
        logResponse(xmlhttp.status, xmlhttp.responseText);
    
        if (xmlhttp.status == 200)
        {
            try
            {
                var jsonObj = JSON.parse(xmlhttp.responseText);
                if (lastCommandSent == "newSession")
                {
                    sessionId = jsonObj.sessionId;
                }
                if (lastCommandSent == "findElement")
                {
                    elementId = jsonObj.value.ELEMENT;
                }
                lastCommandSent = "";
            }
            catch (err)
            {
                logError(err.message);
            }
            
        }
    }
    
    function logResponse(status, contentBody) {
        var lResponse = "<div class=\"command-success\">" + "<p>" + getTimeString() + "- Response " + status + "</p>";
        if (contentBody != "") {
            try {
                var jsonObj = JSON.parse(contentBody);
                if ((lastCommandSent == "screenshot" || lastCommandSent == "getElementScreenshot") && status == 200) {
                    var imgBase64 = jsonObj.value;
                    jsonObj.value = "<img src='data:image/png;base64," + imgBase64 + "' />";
                }
    
                lResponse += "<p>Response code " + jsonObj.status + " indicates: " + responseCodeMap.get(jsonObj.status) + "</p>"
    
                var jsonString = JSON.stringify(jsonObj, null, 4);
    
                lResponse += "<pre>" + jsonString + "</pre>";
            }
            catch (err) {
                // The content is not JSON
                lResponse += "<pre>" + contentBody + "</pre>";
            }
        }
        lResponse += "</div>";
    
        var d = document.createElement("div");
        d.class = "loq-response";
        d.innerHTML = lResponse;
    
        var l = document.getElementById("log-contents");
        l.insertBefore(d, l.firstChild);
    }
    
    function checkForIds(str) {
        str = replaceIdInPath(str, "SESSION_ID", true);
        str = replaceIdInPath(str, "ELEMENT_ID", false);
        return str;
    }
    
    // toggle: true = sessionId, false = elementId
    function replaceIdInPath(str, tokenToReplace, toggle) {
        if (toggle) {
            str = str.replace(tokenToReplace, sessionId);
        }
        else {
            str = str.replace(tokenToReplace, elementId);
        }
        return str;
    }
    
    function logError(errMsg) {
        var lError = "<div class=\"command-fail\">" + "<p>" + getTimeString() + "-" + errMsg + "</p></div>";
        var d = document.createElement("div");
        d.class = "log-error";
        d.innerHTML = lError;
    
        var l = document.getElementById("log-contents");
        l.insertBefore(d, l.firstChild);
    }
    
    function getTimeString() {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                    + (currentdate.getMonth() + 1) + "/"
                    + currentdate.getFullYear() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
    
        return datetime;
    }
}());