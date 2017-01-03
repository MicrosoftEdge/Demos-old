(function(){
    'use strict';
    //==============================================================================
    // List of available content files/manifests.
    //==============================================================================
    var videoLibrary = [{
        title: 'Big Buck Bunny',
        property: '',
        caption: '',
        attribution: '(c) Copyright 2008, Blender Foundation / www.bigbuckbunny.org',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/683f7e47-bd83-4427-b0a3-26a6c4547782/BigBuckBunny.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Big Buck Bunny (PlayReady/Widevine)',
        property: 'Protected',
        caption: '',
        attribution: '(c) Copyright 2008, Blender Foundation / www.bigbuckbunny.org',
        baseUrl: 'https://samplestreamseu.streaming.mediaservices.windows.net/65b76566-1381-4540-87ab-7926568901d8/bbb_sunflower_1080p_30fps_normal.ism',
        fileName: 'manifest(format=mpd-time-csf)',
        licenseUrlPlayReady: 'https://samplestreamseu.keydelivery.mediaservices.windows.net/PlayReady/',
        licenseUrlWidevine: 'http://axpr-wv-fe.cloudapp.net:8080/LicensingService'
    }, {
        title: 'Not Your Father\'s Browser',
        property: 'Captioned',
        caption: 'captions/Not_Your_Fathers_Captions.ttml',
        attribution: 'Not Your Father\'s Browser - Episodes 1-10',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/dfcb28e1-8f04-404c-ae22-7462cab948fc/NotYourFathersBrowser.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Sintel Trailer',
        property: 'Protected',
        caption: '',
        attribution: '(c) Copyright Blender Foundation | www.sintel.org',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/bf657309-71d9-4436-b94b-8ac0d2ca222b/SintelTrailer.ism',
        fileName: 'manifest(format=mpd-time-csf)',
        licenseUrlPlayReady: 'https://amssamples.keydelivery.mediaservices.windows.net/PlayReady/'
    }, {
        title: 'Elephant\'s Dream',
        property: '',
        caption: '',
        attribution: '(c) Copyright 2006, Blender Foundation / Netherlands Media Art Institute / www.elephantsdream.org',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/b6822ec8-5c2b-4ae0-a851-fd46a78294e9/ElephantsDream.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Child of the 90s',
        property: 'Captioned',
        caption: 'captions/90s_Captions.ttml',
        attribution: 'You grew up. So did we. Reconnect with the new Internet Explorer.',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/bb34a723-f69a-4231-afba-dc850f9e3da8/ChildOfThe90s.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Sintel Trailer',
        property: '',
        caption: '',
        attribution: '(c) Copyright Blender Foundation | www.sintel.org',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/bc57e088-27ec-44e0-ac20-a85ccbcd50da/TearsOfSteel.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Tears of Steel',
        property: 'Protected',
        caption: '',
        attribution: '(c) Copyright Blender Foundation | mango.blender.org',
        baseUrl: 'https://amssamples.streaming.mediaservices.windows.net/de1470b3-7b3c-4902-ab53-d19b37ef3bd7/TearsOfSteelTeaser.ism',
        fileName: 'manifest(format=mpd-time-csf)',
        licenseUrlPlayReady: 'http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1'
    }];

    // UI elements/functions.
    var library = document.getElementById('library');
    var video = document.getElementById('video');
    var bitrateSlider = document.getElementById('bitrateSlider');
    var bitrateLabel = document.getElementById('bitrateLabel');
    var openlock = document.getElementById('openlock');
    var closedlock = document.getElementById('closedlock');

    //==============================================================================
    // Helpers
    //==============================================================================
    var downloadArrayBuffer = function (url, context, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.msCaching = 'disabled';
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.response, context);
                } else {
                    callback(null, context);
                }
            }
        };
        xhr.send();
        return xhr;
    };

    var prettyPrintHex = function(number) {
        if (number < 0) {
            number += 0x100000000;
        }
        return '0x' + number.toString(16);
    };

    var prettyPrintMediaError = function (error) {
        switch (error) {
            case 1:
                error = 'MEDIA_ERR_ABORTED';
                break;
            case 2:
                error = 'MEDIA_ERR_NETWORK';
                break;
            case 3:
                error = 'MEDIA_ERR_DECODE';
                break;
            case 4:
                error = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
                break;
            default:
                error += '';
        }
        return error;
    };
    //==============================================================================
    // WAMS Manifest Parser
    //==============================================================================
    var Wamsifest = function() {
        this.videoStreams = [];
        this.audioStreams = [];
        this.duration = 0;
    };

    Wamsifest.prototype = {
        loadManifest: function(baseUrl, fileName, callback) {
            var that = this;
            var url = baseUrl + '/' + fileName;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        callback(that.parseManifest(baseUrl, xhr.responseXML));
                    } else {
                        throw('XHR failed (' + url + '). Status: ' + xhr.status + ' (' + xhr.statusText + ')');
                    }
                }
            };
            xhr.send();
        },
        parseManifest: function(baseUrl, xml) {
            this.videoStreams = [];
            this.audioStreams = [];
            this.duration = 0;
            // For now, we'll only look at first period, first audio & video adaptation set.
            var asets = xml.getElementsByTagName('Period')[0].getElementsByTagName('AdaptationSet');
            for (var i = 0; i < asets.length; i++) {
                var streamList;
                if (asets[i].getAttribute('mimeType').substring(0, 5).toLowerCase() === 'video') {
                    streamList = this.videoStreams;
                } else if (asets[i].getAttribute('mimeType').substring(0, 5).toLowerCase() === 'audio') {
                    streamList = this.audioStreams;
                }
                if (streamList && streamList.length === 0) {
                    var template = asets[i].getElementsByTagName('SegmentTemplate')[0];
                    var initPattern = template.getAttribute('initialization');
                    var mediaPattern = template.getAttribute('media');
                    var timescale = parseInt(template.getAttribute('timescale'));
                    var timeline = template.getElementsByTagName('SegmentTimeline')[0].getElementsByTagName('S');
                    var reps = asets[i].getElementsByTagName('Representation');
                    for (var j = 0; j < reps.length; j++) {
                        var id = reps[j].getAttribute('id');
                        var bandwidth = reps[j].getAttribute('bandwidth');
                        var segments = [];
                        var time = 0;
                        for (var k = 0; k < timeline.length; k++) {
                            var duration = parseInt(timeline[k].getAttribute('d'));
                            var repeats = timeline[k].getAttribute('r');
                            repeats = repeats ? parseInt(repeats) : 0;
                            while (repeats-- >= 0) {
                                segments.push({
                                    timeStamp: time / timescale,
                                    duration: duration / timescale,
                                    url: baseUrl + '/' + mediaPattern.replace(/\$Bandwidth\$/, bandwidth).replace(/\$Time\$/, time).replace(/\$RepresentationID\$/, id)
                                });
                                time += duration;
                            }
                        }
                        var duration = time / timescale;
                        if (duration > this.duration) {
                            this.duration = duration;
                        }
                        bandwidth = parseInt(bandwidth);
                        for (var k = 0; k <= streamList.length; k++) {
                            if (k === streamList.length || bandwidth < streamList[k].bandwidth) {
                                streamList.splice(k, 0, {
                                    bandwidth: parseInt(bandwidth),
                                    initUrl: baseUrl + '/' + initPattern.replace(/\$Bandwidth\$/, bandwidth).replace(/\$RepresentationID\$/, id),
                                    segments: segments,
                                    duration: duration
                                });
                                break;
                            }
                        }
                    }
                }
            }
            return this.videoStreams.length > 0 || this.audioStreams.length > 0;
        }
    };
    //==============================================================================
    // Buffer Manager
    //==============================================================================
    var SourceBufferManager = function(vid, streamList, mimeType) {
        this.vid = vid;
        this.streamList = streamList;
        this.mimeType = mimeType;
        this.inited = false;
        this.appending = false;
        this.activeDownload = null;
        this.qualityLevel = 0;
        this.segCursor = 0;
        this.eos = false;
        this.sb = null;
    };

    SourceBufferManager.prototype = {
        MAX_GAP: 0.1,
        MAX_BUFFER: 5,
        REMOVE_BUFFER: 5,
        create: function(mse) {
            var that = this;
            this.sb = mse.addSourceBuffer(this.mimeType);
            // SourceBuffer events not yet defined in Chrome
            if (this.sb.addEventListener) {
                this.sb.addEventListener('abort', function() {
                    throw 'Unexpected append \'abort\' event';
                }, false);
                this.sb.addEventListener('update', function() {
                    that.appending = false;
                    that.updateData();
                }, false);
                this.sb.addEventListener('error', function() {
                    throw 'Unexpected append \'error\' event';
                }, false);
            }
        },
        updateData: function() {
            this.sendInitSegment();
            this.cleanBuffer();
            this.sendMediaSegment();
        },
        sendInitSegment: function() {
            var that = this;
            if (this.inited) {
                return;
            }
            if (!this.streamList[this.qualityLevel].initSegmentData) {
                if (!this.streamList[this.qualityLevel].initSegmentDownloading) {
                    this.streamList[this.qualityLevel].initSegmentDownloading = true;
                    downloadArrayBuffer(this.streamList[this.qualityLevel].initUrl, this.qualityLevel, function(data, qualityLevel) {
                        that.streamList[qualityLevel].initSegmentData = data;
                        that.streamList[qualityLevel].initSegmentDownloading = false;
                        if (data) {
                            that.updateData();
                        }
                    });
                }
                return;
            }
            if (this.appending) {
                return;
            }
            this.eos = false;
            this.appending = true;
            this.sb.appendBuffer(this.streamList[this.qualityLevel].initSegmentData);
            this.inited = true;
        },
        cleanBuffer: function() {
            if (this.eos || this.appending) {
                return;
            }
            if (this.sb.buffered.length > 0) {
                if (this.vid.currentTime - this.REMOVE_BUFFER <= this.sb.buffered.start(0)) {
                    return;
                }
            } else {
                return;
            }
            this.appending = true;
            this.sb.remove(this.sb.buffered.start(0), this.vid.currentTime - this.REMOVE_BUFFER);
        },
        sendMediaSegment: function() {
            var that = this;
            if (!this.inited || this.appending) {
                return;
            }
            if (this.segCursor >= this.streamList[this.qualityLevel].segments.length) {
                this.eos = true;
                return;
            }
            var end = this.vid.currentTime;
            for (var i = 0; i < this.sb.buffered.length; i++) {
                if (this.sb.buffered.start(i) <= end + that.MAX_GAP && this.sb.buffered.end(i) > end) {
                    end = this.sb.buffered.end(i);
                } else if (this.sb.buffered.start(i) > end) {
                    break;
                }
            }
            var seg = this.streamList[this.qualityLevel].segments[this.segCursor];
            if (seg.timeStamp + seg.duration <= end) {
                this.segCursor++;
                this.sendMediaSegment();
                return;
            }
            if (this.vid.currentTime + this.MAX_BUFFER <= end) {
                return;
            }
            this.appending = true;
            this.activeDownload = downloadArrayBuffer(seg.url, null, function(data) {
                if (data) {
                    that.eos = false;
                    that.sb.appendBuffer(data);
                    that.segCursor++;
                } else {
                    that.appending = false;
                }
            });
        },
        doSeek: function() {
            // Calculate the segment we seeked into.
            var segIndex = 0;
            for (var i = 0; i < this.streamList[this.qualityLevel].segments.length; i++) {
                if (this.streamList[this.qualityLevel].segments[i].timeStamp <= this.vid.currentTime) {
                    segIndex = i;
                } else {
                    break;
                }
            }
            // If we moved, cancel any outstanding media segment download.
            if (segIndex !== this.segCursor) {
                if (this.activeDownload) {
                    this.activeDownload.abort();
                }
                this.segCursor = segIndex;
                this.updateData();
            }
        },
        doStop: function() {
            // Cancel any outstanding media segment download.
            if (this.activeDownload) {
                this.activeDownload.abort();
            }
        },
        changeQuality: function(newQuality) {
            this.qualityLevel = newQuality;
            this.inited = false;
        }
    };

    var Player = function (vid, mse, manifest) {
        this.vid = vid;
        this.mse = mse;
        this.manifest = manifest;
        this.buffers = [
            new SourceBufferManager(vid, manifest.videoStreams, 'video/mp4; codecs="avc1.42C00D"'),
            new SourceBufferManager(vid, manifest.audioStreams, 'audio/mp4; codecs="mp4a.40.2"')
        ];
        this.opened = false;
    };

    window.onerror = function (error){
        writeError(error);
    };

    Player.prototype = {
        initialize: function(autoplay) {
            var that = this;
            var timeupdater = function() {
                that.updateData();
            };
            var seeker = function() {
                that.doSeek();
            };

            var openSource = function() {
                if (this.opened) {
                    return;
                }
                this.opened = true;
                that.vid.addEventListener('timeupdate', timeupdater, false);
                that.vid.addEventListener('seeking', seeker, false);
                that.mse.duration = that.manifest.duration;
                for (var i = 0; i < that.buffers.length; i++) {
                    that.buffers[i].create(that.mse);
                }
                that.updateData();
            };

            var sourceClose = function() {
                that.vid.removeEventListener('timeupdate', timeupdater, false);
                that.vid.removeEventListener('seeking', seeker, false);
                for (var i = 0; i < that.buffers.length; i++) {
                    that.buffers[i].doStop();
                }
            };

            this.mse.addEventListener('sourceopen', openSource, false);
            this.mse.addEventListener('webkitsourceopen', openSource, false);

            this.mse.addEventListener('sourceclose', sourceClose, false);
            this.mse.addEventListener('webkitsourceclose', sourceClose, false);

            console.log('Setting src: ' + this.mse);
            this.vid.src = URL.createObjectURL(this.mse);
            if (autoplay) {
                this.vid.play();
            }
        },
        updateData: function() {
            var eos = true;
            for (var i = 0; i < this.buffers.length; i++) {
                this.buffers[i].updateData();
                if (!this.buffers[i].eos) {
                    eos = false;
                }
            }
            if (eos) {
                if (this.mse.readyState === 'open') {
                    this.mse.endOfStream();
                }
            }
        },
        doSeek: function() {
            var pos = this.vid.currentTime;
            for (var i = 0; i < this.buffers.length; i++) {
                this.buffers[i].doSeek(pos);
            }
        },
        getQualityLevel: function(stream) {
            return this.buffers[stream].qualityLevel;
        },
        setQualityLevel: function(stream, newQuality) {
            this.buffers[stream].changeQuality(newQuality);
        }
    };

    // PlayReady and Widevine License Manager constructor
    var LicenseManager = function (vid) {
        this.vid = vid;
        if (window.navigator.requestMediaKeySystemAccess) {
            // EME V2 (EdgeHTML+)
            console.log('setting \'encrypted\' event listener');
            vid.addEventListener('encrypted', this.onEncryptedRequest, false);
        }
        else {
            // EME V1 (MSHTML)
            vid.addEventListener('msneedkey', this.getNewPrefixedKeySession, false);
        }
    };

    LicenseManager.prototype = {
        vid: null,
        LICENSE_TYPE_NONE: 0,
        LICENSE_TYPE_WIDEVINE: 1,
        LICENSE_TYPE_PLAYREADY: 2,
        licenseType: 0,
        licenseUrlPlayReady: null,
        licenseUrlWidevine: null,
        playReadyKeySystem: {
            keySystem: 'com.microsoft.playready',
            supportedConfig: [
                {
                    initDataTypes: ['keyids', 'cenc'],
                    audioCapabilities:
                        [
                            {
                                contentType: 'audio/mp4; codecs="mp4a"'
                            }
                        ],
                    videoCapabilities:
                        [
                            {
                                contentType: 'video/mp4; codecs="avc1"'
                            }
                        ]
                }
            ]
        },
        widevineKeySystem: {
            keySystem: 'com.widevine.alpha',
            supportedConfig: [
                {
                    initDataTypes: ['keyids', 'webm'],
                    audioCapabilities:
                        [
                            {
                                contentType: 'audio/webm; codecs="opus"'
                            }
                        ],
                    videoCapabilities:
                        [
                            {
                                contentType: 'video/webm; codecs="vp9"'
                            }
                        ]
                }
            ]
        },
        onEncryptedRequest: function (e) {
            console.log('onencrypted fired.');
            var lm = e.target.licenseManager;
            // If we have not created a mediaKeys object yet, do it now.
            if (lm.mediaKeys === undefined) {
                lm.initMediaKeys(e);
            }
            lm.handleSession(e.target, e.initDataType, e.initData);
        },
        initMediaKeys: function (e) {
            var that = this;
            this.mediaKeys = null;
            this.vid.pendingSessionData = [];

            // Try PlayReady
            navigator.requestMediaKeySystemAccess(this.playReadyKeySystem.keySystem, this.playReadyKeySystem.supportedConfig).then(function (keySystemAccess) {
                console.log('createMediaKeys (PlayReady)');
                that.licenseType = that.LICENSE_TYPE_PLAYREADY;
                setLockAndMessage(true, 'Using unprefixed EME and PlayReady DRM.');
                keySystemAccess.createMediaKeys().then(function (createdMediaKeys) {
                    that.onMediaKeyAcquired(that, createdMediaKeys);
                }).catch('createMediaKeys() failed');
            }, function () {
                // PlayReady didn't work. Try Widevine.
                navigator.requestMediaKeySystemAccess(that.widevineKeySystem.keySystem, that.widevineKeySystem.supportedConfig).then(function (keySystemAccess) {
                    console.log('createMediaKeys (Widevine)');
                    that.licenseType = that.LICENSE_TYPE_WIDEVINE;
                    setLockAndMessage(true, 'Using unprefixed EME and Widevine DRM.');
                    keySystemAccess.createMediaKeys().then(function (createdMediaKeys) {
                        that.onMediaKeyAcquired(that, createdMediaKeys);
                    }).catch('createMediaKeys() failed');
                }, function () { writeError('Your browser/system does not support the requested configurations for playing protected content.'); });
            });
        },
        onMediaKeyAcquired: function (prm, createdMediaKeys) {
            console.log('createMediaKeys success');
            prm.mediaKeys = createdMediaKeys;
            // Flush pending session data.
            for (var i = 0; i < prm.vid.pendingSessionData.length; i++) {
                var data = prm.vid.pendingSessionData[i];
                prm.getNewKeySession(createdMediaKeys, data.initDataType, data.initData);
            }
            prm.vid.pendingSessionData = [];
            prm.vid.setMediaKeys(createdMediaKeys);
        },
        handleSession : function(vid, initDataType, initData) {
            // If we have a mediaKeys object, we can just download a key.
            if (this.mediaKeys) {
                this.getNewKeySession(this.mediaKeys, initDataType, initData);
            }
            else
            {
                console.log('Storing pending session data');
                // Otherwise, we store the session data for when we get a key.
                vid.pendingSessionData.push({ initDataType: initDataType, initData: initData });
            }
        },
        clearEvents: function () {
            video.removeEventListener('encrypted', this.onEncryptedRequest, false);
        },
        downloadNewKey: function (url, keyMessage, callback) {
            console.log('downloadNewKey (xhr)');
            var challenge;
            var xhr = new XMLHttpRequest();
            var index = location.pathname.indexOf('testdrive');
            var finalUrl = url;
            if (index !== -1) {
                finalUrl = location.pathname.substr(0, index) + 'api/testdrive/proxy/?url=' + url;
            }
            xhr.open('POST', finalUrl);
            xhr.responseType = 'arraybuffer';
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        callback(xhr.response);
                    } else {
                        throw 'XHR failed (' + url + '). Status: ' + xhr.status + ' (' + xhr.statusText + ')';
                    }
                }
            };
            if (this.licenseType !== this.LICENSE_TYPE_WIDEVINE) {
                // For PlayReady CDMs, we need to dig the Challenge out of the XML.
                var keyMessageXml = new DOMParser().parseFromString(String.fromCharCode.apply(null, new Uint16Array(keyMessage)), 'application/xml');
                if (keyMessageXml.getElementsByTagName('Challenge')[0]) {
                    challenge = atob(keyMessageXml.getElementsByTagName('Challenge')[0].childNodes[0].nodeValue);
                } else {
                    throw 'Cannot find <Challenge> in key message';
                }
                var headerNames = keyMessageXml.getElementsByTagName('name');
                var headerValues = keyMessageXml.getElementsByTagName('value');
                if (headerNames.length !== headerValues.length) {
                    throw 'Mismatched header <name>/<value> pair in key message';
                }
                for (var i = 0; i < headerNames.length; i++) {
                    xhr.setRequestHeader(headerNames[i].childNodes[0].nodeValue, headerValues[i].childNodes[0].nodeValue);
                }
            }
            else
            {
                // For Widevine CDMs, the challenge is the keyMessage.
                challenge = keyMessage;
            }

            xhr.send(challenge);
        },
        getNewKeySession: function (mediaKeys, initDataType, initData) {
            console.log('createSession');
            var that = this;
            var keySession = mediaKeys.createSession();
            keySession.addEventListener('message', function (event) {
                console.log('onmessage');
                that.downloadNewKey(that.getLicenseUrl(), event.message, function (data) {
                    console.log('event.target.update');
                    event.target.update(data);
                });
            }, false);
            keySession.generateRequest(initDataType, initData).catch(function () {
                writeError('Unable to create or initialize key session. Your browser may not support the selected video\'s key system');
            });
        },
        getLicenseUrl: function () {
            if (this.licenseType === this.LICENSE_TYPE_PLAYREADY) {
                return this.licenseUrlPlayReady;
            }
            else if (this.licenseType === this.LICENSE_TYPE_WIDEVINE) {
                return this.licenseUrlWidevine;
            }
            return '';
        },
        getNewPrefixedKeySession : function (e) {
            var key_system = 'com.microsoft.playready';
            var that = this.licenseManager;
            if (!this.msKeys) {
                try {
                    /* eslint-disable no-undef */
                    this.msSetMediaKeys(new MSMediaKeys(key_system));
                    /* eslint-enable no-undef */
                    setLockAndMessage(true, 'Using prefixed EME and PlayReady DRM.');
                } catch (ex) {
                    throw 'Unable to create MediaKeys("' + key_system + '"). Verify the components are installed and functional. Original error: ' + ex.message;
                }
            } else {
                return;
            }
            var session = this.msKeys.createSession('video/mp4', e.initData);
            if (!session) {
                throw 'Could not create key session';
            }
            session.addEventListener('mskeymessage', function (event) {
                that.downloadNewKey(event.destinationURL, event.message.buffer, function (data) {
                    session.update(new Uint8Array(data));
                });
            });
            session.addEventListener('mskeyerror', function () {
                throw 'Unexpected \'keyerror\' event from key session. Code: ' + session.error.code + ', systemCode: ' + session.error.systemCode;
            });
        }
    };

    //==============================================================================
    // Feature Detect
    //==============================================================================
    var mseSupported;

    var showErrorNotice = function (text) {
        var errorElem = document.getElementById('error-display');
        errorElem.innerHTML = '';
        errorElem.appendChild(document.createTextNode(text));
        document.getElementById('error-container').style.display = '';
    };

    var hideErrorNotice = function () {
        document.getElementById('error-container').style.display = 'none';
    };

    var writeError = function (msg) {
        showErrorNotice(msg);
    };

    var detectMSESupport = function () {
        // Check for MediaSource support.
        if (window.MediaSource) {
            mseSupported = true;
            window.webkitRequired = false;
            //  Else, check for WebKitMediaSource AND appendBuffer support (for up to date MSE).
        } else if (window.WebKitMediaSource) {
            mseSupported = true;
            window.webkitRequired = true;
            if (!window.WebKitSourceBuffer.prototype.appendBuffer) {
                mseSupported = false;
                writeError('Your browser does not support the most recent version of Media Source Extensions and is unable to play these videos.');
            }
            //  Else, no MSE.
        } else {
            mseSupported = false;
            writeError('Your browser does not support Media Source Extensions and is unable to play these videos.');
        }
    };
    //==============================================================================
    // Kickoff
    //==============================================================================

    // Check for MSE support
    detectMSESupport();

    var setLockAndMessage = function (locked, message) {
        if (locked) {
            openlock.style.display = 'none';
            closedlock.style.display = 'inline-block';
        } else {
            openlock.style.display = 'inline-block';
            closedlock.style.display = 'none';
        }
        var notice = document.getElementById('emenotice');
        if (notice)
        {
            notice.innerHTML = message || 'DRM Free';
        }
    };

    video.addEventListener('error', function () {
        if (video.error.msExtendedCode) {
            writeError('Unexpected \'error\' event from media element. Code: ' + prettyPrintMediaError(video.error.code) + ', msExtendedCode: ' + prettyPrintHex(video.error.msExtendedCode));
        } else {
            writeError('Unexpected \'error\' event from media element. Code: ' + prettyPrintMediaError(video.error.code));
        }
    }, false);

    var defaultVideo = false;
    var selectedVideo = -1;

    // Load the given video from library.
    var player = null;
    var loadVideo = function (index) {
        if (defaultVideo !== true) {
            video.poster = '';
        }
        var manifest = new Wamsifest();
        manifest.loadManifest(videoLibrary[index].baseUrl, videoLibrary[index].fileName, function (parsed) {
            if (!parsed) {
                throw 'Failed to parse manifest. Only "SegmentTimeline" manifests are supported currently.';
            }
            var mse = new (window.MediaSource || window.WebKitMediaSource)();
            if (video.licenseManager) {
                video.licenseManager.clearEvents();
            }
            if (video.mediaKeys) {
                video.setMediaKeys(null);
            }
            video.licenseManager = new LicenseManager(video);
            video.licenseManager.licenseUrlPlayReady = videoLibrary[index].licenseUrlPlayReady || null;
            video.licenseManager.licenseUrlWidevine = videoLibrary[index].licenseUrlWidevine || null;
            player = new Player(video, mse, manifest);

            // Configure UI controls.
            setLockAndMessage(false);
            bitrateSlider.max = manifest.videoStreams.length - 1;
            bitrateSlider.value = bitrateSlider.max / 3;
            bitrateSlider.onchange = (function () {
                var change = function () {
                    bitrateSlider.setAttribute('value', bitrateSlider.value);
                    bitrateLabel.innerHTML = Math.round(manifest.videoStreams[bitrateSlider.value].bandwidth / 1000) + ' kbps';
                    player.setQualityLevel(0, bitrateSlider.value);
                };
                change();
                return change;
            }());
            player.initialize(!defaultVideo);
        });
    };

    // Handle the clicking of a new video
    var videoClickHandler = function (index) {
        return function () {
            if (selectedVideo >= 0) {
                document.getElementById('video' + selectedVideo).removeAttribute('selected');
            }
            hideErrorNotice();
            defaultVideo = false;
            selectedVideo = index;
            document.getElementById('video' + selectedVideo).setAttribute('selected', 'selected');
            loadVideo(index);

            // Check for captions and add/remove track support as needed
            var videoTarget = document.getElementById('video');
            // Remove existing captions
            if (document.getElementById('Captions') != null) {
                var track = document.getElementById('Captions');
                videoTarget.removeChild(track);
            }
            // Add new captions, if file supports them
            if (videoLibrary[index].property === 'Captioned') {
                var newTrack = document.createElement('track');
                newTrack.src = videoLibrary[index].caption;
                newTrack.label = 'English Captions';
                newTrack.default = true;
                newTrack.id = 'Captions';
                videoTarget.appendChild(newTrack);
            }
        };
    };

    // Populate the library of video files.
    var gatherVideos = function () {
        for (var i = 0; i < videoLibrary.length; i++) {
            var div = document.createElement('div');
            div.id = 'video' + i;
            div.className = 'movie row';
            div.onclick = videoClickHandler(i);
            // Draw library elements, with closed lock on protected files
            var html = '<p class="subtitle">' + videoLibrary[i].title + '</p><p class="caption property">' + videoLibrary[i].property;
            if (videoLibrary[i].property === 'Protected') {
                html += '<img class="lockimg" src="images/locked.png" />';
            }
            html += '</p><p class="caption">' + videoLibrary[i].attribution + '</p> ';
            div.innerHTML = html;
            library.appendChild(div);
            // Select first video by default, but check first for MSE support.  Dialog will already be up if it isn't.
            if (mseSupported === true) {
                if (selectedVideo === -1) {
                    defaultVideo = true;
                    selectedVideo = 0;
                    document.getElementById('video' + selectedVideo).setAttribute('selected', 'selected');
                    loadVideo(selectedVideo);
                }
            }
        }
    };
    gatherVideos();
} ());