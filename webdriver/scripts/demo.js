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
            o.innerHTML = commands[j].commandTitle;
    
            s.appendChild(o);
        }
    }
    
    function loadCommands() {
        commands = [];
        commands.push({
            commandName: "click",
            commandTitle: "Click",
            method: "POST",
            path: "/session/SESSION_ID/element/ELEMENT_ID/click",
            requestBody: "",
            description: "Clicks the selected element. You must first find an element on the page using the Find Element command to click." });
        commands.push({
            commandName: "executeScript",
            commandTitle: "Execute JavaScript",
            method: "POST",
            path: "/session/SESSION_ID/execute",
            requestBody: "{\"script\": \"return arguments[0].second;\",\"args\": [{\"first\":\"1st\", \"second\":\"2nd\", \"third\":\"3rd\"}]}",
            description: "Runs a script on the page. Replace the \"return arguments[0].second;\" value in Content with custom JavaScript." });
        commands.push({
            commandName: "findElement",
            commandTitle: "Find Element",
            method: "POST",
            path: "/session/SESSION_ID/element",
            requestBody: "{\"using\": \"id\",\"value\": \"clickAnchorElement\"}",
            description: "Finds an element on the page by its id. Replace the \"clickAnchorElement\" value in Content with an id of an element from the page Microsoft Edge is on." });
        commands.push({
            commandName: "get",
            commandTitle: "Navigate to URL",
            method: "POST",
            path: "/session/SESSION_ID/url",
            requestBody: "{\"url\":\"http://www.bing.com\"}",
            description: "Instructs the browser to navigate to a url. Replace the \"http://www.bing.com\" value in Content with a url of your choice to navigate to the given url." });
        commands.push({
            commandName: "getElementAttribute",
            commandTitle: "Get Element Attribute",
            method: "GET",
            path: "/session/SESSION_ID/element/ELEMENT_ID/attribute/:name",
            requestBody: "",
            description: "Given a selected element from the Find Element command, the browser will return a given attribute. Replace the \":name\" value in the Path to a valid HTML attribute." });
        commands.push({
            commandName: "getElementScreenshot",
            commandTitle: "Get Element Screenshot",
            method: "GET",
            path: "/session/SESSION_ID/element/ELEMENT_ID/screenshot",
            requestBody: "",
            description: "Given a selected element from the Find Element command, the browser will return a screenshot of said element." });
        commands.push({
            commandName: "getElementTagName",
            commandTitle: "Get Element Tag Name",
            method: "GET",
            path: "/session/SESSION_ID/element/ELEMENT_ID/name",
            requestBody: "",
            description: "Given a selected element from the Find Element command, the browser will return the name of the element." });
        commands.push({
            commandName: "getElementText",
            commandTitle: "Get Element Text",
            method: "GET",
            path: "/session/SESSION_ID/element/ELEMENT_ID/text",
            requestBody: "",
            description: "Given a selected element from the Find Element command, the browser will return the text of the element." });
        commands.push({
            commandName: "getPageTitle",
            commandTitle: "Get Page Title",
            method: "GET",
            path: "/session/SESSION_ID/title",
            requestBody: "",
            description: "Instructs the browser to return the Title of the given page." });
        commands.push({
            commandName: "newSession",
            commandTitle: "New Session",
            method: "POST",
            path: "/session",
            requestBody: "{\"desiredCapabilities\":{ \"browserName\":\"<browserName>\", \"browserVersion\":\"<browserVersion>\", \"platformName\":\"Windows NT\", \"platformVersion\":\"10\"},\"requiredCapabilities\":{}}",
            description: "Starts a new session of the browser. Currently Microsoft Edge only supports one session via WebDriver." });
        commands.push({
            commandName: "quit",
            commandTitle: "End Session",
            method: "DELETE",
            path: "/session/SESSION_ID",
            requestBody: "",
            description: "Ends the given session of the browser." });
        commands.push({
            commandName: "screenshot",
            commandTitle: "Take Screenshot",
            method: "GET",
            path: "/session/SESSION_ID/screenshot",
            requestBody: "",
            description: "Takes a screenshot of the given viewport." });
        commands.push({
            commandName: "sendKeys",
            commandTitle: "Send Keys",
            method: "POST",
            path: "/session/SESSION_ID/element/ELEMENT_ID/value",
            requestBody: "{\"value\": [\"a\", \"b\", \"c\"]}",
            description: "Inputs a string into the given element. You must first select a valid element with an input on the page using the Find Element command to work. Replace the array in the Content with a string value. Can be multiple strings or a single string." });
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
                document.getElementById("command-description").innerText = commands[i].description;
    
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
        var lRequest = "<div class=\"webdriver-info\">" + "<p>" + getTimeString() + " - Request " + method + " " + url + "</p>";
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
        var lResponse = "<div class=\"webdriver-response\">" + "<p>" + getTimeString() + " - Response " + status + "</p>";
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