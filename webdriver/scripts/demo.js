(function(){
    'use strict';

    var sessionId;
    var elementId;
    var lastCommandSent;
    var commands = [
        {
            commandName: 'click',
            commandTitle: 'Click',
            method: 'POST',
            path: '/session/SESSION_ID/element/ELEMENT_ID/click',
            requestBody: '',
            description: 'Clicks the specified element.'
        },
        {
            commandName: 'executeScript',
            commandTitle: 'Execute JavaScript',
            method: 'POST',
            path: '/session/SESSION_ID/execute',
            requestBody: '{\"script\": \"alert(arguments[0].first);\",\"args\": [{\"first\":\"hey\"}]}',
            description: 'Runs script on the page.'
        },
        {
            commandName: 'findElement',
            commandTitle: 'Find Element',
            method: 'POST',
            path: '/session/SESSION_ID/element',
            requestBody: '{\"using\": \"id\",\"value\": \"sb_form_q\"}',
            description: 'Finds an element on the page by its id.'
        },
        {
            commandName: 'get',
            commandTitle: 'Navigate to URL',
            method: 'POST',
            path: '/session/SESSION_ID/url',
            requestBody: '{\"url\":\"https://www.bing.com/\"}',
            description: 'Navigates to the specified url.'
        },
        {
            commandName: 'getElementAttribute',
            commandTitle: 'Get Element Attribute',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/attribute/name',
            requestBody: '',
            description: 'Returns the value of the specified element attribute.'
        },
        {
            commandName: 'getElementScreenshot',
            commandTitle: 'Get Element Screenshot',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/screenshot',
            requestBody: '',
            description: 'Returns a screenshot of the specified element.'
        },
        {
            commandName: 'getElementTagName',
            commandTitle: 'Get Element Tag Name',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/name',
            requestBody: '',
            description: 'Returns the tag name of the specified element.'
        },
        {
            commandName: 'getElementText',
            commandTitle: 'Get Element Text',
            method: 'GET',
            path: '/session/SESSION_ID/element/ELEMENT_ID/text',
            requestBody: '',
            description: 'Returns the inner text of the specified element.'
        },
        {
            commandName: 'getPageTitle',
            commandTitle: 'Get Page Title',
            method: 'GET',
            path: '/session/SESSION_ID/title',
            requestBody: '',
            description: 'Returns the title of the page.'
        },
        {
            commandName: 'newSession',
            commandTitle: 'Start Session',
            method: 'POST',
            path: '/session',
            requestBody: '{\"desiredCapabilities\":{},\"requiredCapabilities\":{}}',
            description: 'Starts a new WebDriver session.'
        },
        {
            commandName: 'quit',
            commandTitle: 'End Session',
            method: 'DELETE',
            path: '/session/SESSION_ID',
            requestBody: '',
            description: 'Ends the WebDriver session.'
        },
        {
            commandName: 'screenshot',
            commandTitle: 'Take Screenshot',
            method: 'GET',
            path: '/session/SESSION_ID/screenshot',
            requestBody: '',
            description: 'Takes a viewport screenshot.'
        },
        {
            commandName: 'sendKeys',
            commandTitle: 'Send Keys',
            method: 'POST',
            path: '/session/SESSION_ID/element/ELEMENT_ID/value',
            requestBody: '{\"value\": [\"webdriver\"]}',
            description: 'Inputs a string into the specified element.'
        }
    ];

    /* Helper Functions */
    // toggle: true = sessionId, false = elementId
    var replaceIdInPath = function (str, tokenToReplace, toggle) {
        if (toggle && sessionId != null) {
            str = str.replace(tokenToReplace, sessionId);
        }
        else {
            if (elementId != null) {
                str = str.replace(tokenToReplace, elementId);
            }
        }
        return str;
    };

    var checkForIds = function (str) {
        str = replaceIdInPath(str, 'SESSION_ID', true);
        str = replaceIdInPath(str, 'ELEMENT_ID', false);
        return str;
    };

    var clearLog = function () {
        document.getElementById('log-contents').innerHTML = '';
    };

    var clearAll = function () {
        sessionId = '';
        elementId = '';
        clearLog();
    };

    var updateCommand = function () {
        var s = document.getElementById('commands-select');

        for (var i = 0; i < commands.length; i++) {
            if (commands[i].commandName === s.options[s.selectedIndex].value) {
                document.getElementById('methods-select').value = commands[i].method;
                document.getElementById('path').value = checkForIds(commands[i].path);
                document.getElementById('command-description').innerText = commands[i].description;

                if (commands[i].requestBody !== '') {
                    try {
                        var jsonObj = JSON.parse(commands[i].requestBody);
                        var jsonString = JSON.stringify(jsonObj, null, 4);
                        document.getElementById('content-area').value = checkForIds(jsonString);
                    }
                    catch (err) {
                        logError(err.message);
                    }
                }
                else {
                    document.getElementById('content-area').value = '';
                }
                break;
            }
        }
    };

    var getTimeString = function () {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + '/'
                    + (currentdate.getMonth() + 1) + '/'
                    + currentdate.getFullYear() + ' '
                    + currentdate.getHours() + ':'
                    + currentdate.getMinutes() + ':'
                    + currentdate.getSeconds();

        return datetime;
    };

    var logRequest = function (method, url, requestBody) {
        var lRequest = '<div class=\'webdriver--info\'>' + '<p>' + getTimeString() + ' - Request ' + method + ' ' + url + '</p>';
        if (requestBody !== '')
        {
            try
            {
                var jsonObj = JSON.parse(requestBody);
                var jsonString = JSON.stringify(jsonObj, null, 4);
                lRequest += '<pre>' + jsonString + '</pre>';
            }
            catch (err)
            {
                logError(err.message);
            }
        }
        lRequest += '</div>';

        var d = document.createElement('div');
        d.class = 'loq-request';
        d.innerHTML = lRequest;

        var l = document.getElementById('log-contents');
        l.insertBefore(d, l.firstChild);
    };

    var logResponse = function (status, contentBody) {
        var lResponse = '<div class=\'webdriver--response\'>' + '<p>' + getTimeString() + ' - Response ' + status + '</p>';
        if (contentBody !== '') {
            try {
                var jsonObj = JSON.parse(contentBody);
                if ((lastCommandSent === 'screenshot' || lastCommandSent === 'getElementScreenshot') && status === 200) {
                    var imgBase64 = jsonObj.value;
                    jsonObj.value = '<img src=\'data:image/png;base64\,' + imgBase64 + '\' />';
                }

                var jsonString = JSON.stringify(jsonObj, null, 4);

                lResponse += '<pre>' + jsonString + '</pre>';
            }
            catch (err) {
                // The content is not JSON
                lResponse += '<pre>' + contentBody + '</pre>';
            }
        }
        lResponse += '</div>';

        var d = document.createElement('div');
        d.class = 'loq-response';
        d.innerHTML = lResponse;

        var l = document.getElementById('log-contents');
        l.insertBefore(d, l.firstChild);
    };

    var processResponse = function (xmlhttp) {
        logResponse(xmlhttp.status, xmlhttp.responseText);

        if (xmlhttp.status === 200)
        {
            try
            {
                var jsonObj = JSON.parse(xmlhttp.responseText);
                if (lastCommandSent === 'newSession')
                {
                    sessionId = jsonObj.sessionId;
                }
                if (lastCommandSent === 'findElement')
                {
                    elementId = jsonObj.value.ELEMENT;
                }
                lastCommandSent = '';
            }
            catch (err)
            {
                logError(err.message);
            }

        }
    };

     var sendRequest = function () {
        var path = document.getElementById('path').value;
        var host = 'http://localhost';
        var port = '17556';
        var url = host + ':' + port + path;
        var requestBody = document.getElementById('content-area').value;
        var method = document.getElementById('methods-select').value;
        logRequest(method, url, requestBody);

        lastCommandSent = document.getElementById('commands-select').value;

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                processResponse(xmlhttp);
            }
        };

        xmlhttp.open(method, url, true);
        if (requestBody === '') {
            xmlhttp.send();
        }
        else {
            xmlhttp.send(requestBody);
        }
    };

    var logError = function (errMsg) {
        var lError = '<div class=\'command-fail\'>' + '<p>' + getTimeString() + '-' + errMsg + '</p></div>';
        var d = document.createElement('div');
        d.class = 'log-error';
        d.innerHTML = lError;

        var l = document.getElementById('log-contents');
        l.insertBefore(d, l.firstChild);
    };

    /* Setup Commands */
    var setupCommands = function () {
        var s = document.getElementById('commands-select');
        for (var j = 0; j < commands.length; j++) {
            var o = document.createElement('OPTION');
            o.value = commands[j].commandName;
            o.id = 'commands-select-' + commands[j].commandName;
            o.innerHTML = commands[j].commandTitle;

            s.appendChild(o);
        }
    };

    /* Setup HTTP Methods */
    var setupHttpMethods = function () {
        var methods = ['GET', 'POST', 'DELETE'];

        var s = document.getElementById('methods-select');
        for (var j = 0; j < methods.length; j++) {
            var o = document.createElement('OPTION');
            o.value = methods[j];
            o.innerHTML = methods[j];
            s.appendChild(o);
            o.selected = true;
        }
    };

    /* Setup Event Listeners */
    var addSendRequestListener = function () {
        var sendRequestElement = document.getElementById('send-request');

        sendRequestElement.addEventListener('click', sendRequest);
    };

    var addCommandListener = function () {
        var updateCommandElement = document.getElementById('commands-select');

        updateCommandElement.addEventListener('change', updateCommand);
    };

    var addClearLogListener = function () {
        var clearLogElement = document.getElementById('clear-log');

        clearLogElement.addEventListener('click', clearLog);
    };

    var addClearAllListener = function () {
        var clearAllElement = document.getElementById('clear-all');

        clearAllElement.addEventListener('click', clearAll);
    };

    var setupEventListeners = function () {
        addSendRequestListener();
        addCommandListener();
        addClearLogListener();
        addClearAllListener();
    };

    /* Load Response Code Map */
    var responseCodeMap = new Map();

    var loadResponseCodeMap = function () {
        responseCodeMap.set(-1, 'Invalid');
        responseCodeMap.set(0, 'Success');
        responseCodeMap.set(6, 'NoSuchDriver');
        responseCodeMap.set(7, 'NoSuchElement');
        responseCodeMap.set(8, 'NoSuchFrame');
        responseCodeMap.set(9, 'UnknownCommand');
        responseCodeMap.set(10, 'StaleElementReference');
        responseCodeMap.set(11, 'ElementNotVisible');
        responseCodeMap.set(12, 'InvalidElementState');
        responseCodeMap.set(13, 'UnknownError');
        responseCodeMap.set(15, 'ElementIsNotSelectable');
        responseCodeMap.set(17, 'JavaScriptError');
        responseCodeMap.set(19, 'XPathLookupError');
        responseCodeMap.set(21, 'Timeout');
        responseCodeMap.set(23, 'NoSuchWindow');
        responseCodeMap.set(24, 'InvalidCookieDomain');
        responseCodeMap.set(25, 'UnableToSetCookie');
        responseCodeMap.set(26, 'UnexpectedAlertOpen');
        responseCodeMap.set(27, 'NoAlertOpenError');
        responseCodeMap.set(28, 'ScriptTimeout');
        responseCodeMap.set(29, 'InvalidElementCoordinates');
        responseCodeMap.set(30, 'IMENotAvailable');
        responseCodeMap.set(31, 'IMEEngineActivationFailed');
        responseCodeMap.set(32, 'InvalidSelector');
        responseCodeMap.set(33, 'SessionNotCreatedException');
        responseCodeMap.set(34, 'MoveTargetOutOfBounds');
        responseCodeMap.set(40, 'UnsupportedOperation');
        responseCodeMap.set(41, 'UnableToTakeScreenshot');
        responseCodeMap.set(42, 'NotImplemented');
        responseCodeMap.set(43, 'InvalidArgument');
    };

    window.onload = function setup() {
        setupCommands();
        setupHttpMethods();
        setupEventListeners();
        loadResponseCodeMap();

        // Defaults to newSession command
        document.getElementById('commands-select-newSession').selected = true;
        updateCommand();
    };
}());
