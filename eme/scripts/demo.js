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
        baseUrl: 'http://wams.edgesuite.net/media/MPTExpressionData02_SeekDemo/BigBuckBunny_1080p24_IYUV_2ch.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Not Your Father\'s Browser',
        property: 'Captioned',
        caption: 'captions/Not_Your_Fathers_Captions.ttml',
        attribution: 'Not Your Father\'s Browser - Episodes 1-10',
        baseUrl: 'http://wams.edgesuite.net/media/notyourfathersbrowser/notyourfathersbrowser.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Sintel Trailer',
        property: 'Protected',
        caption: '',
        attribution: '(c) Copyright Blender Foundation | www.sintel.org',
        baseUrl: 'http://wams.edgesuite.net/media/SintelTrailer_Smooth_from_WAME_CENC/NoSubSampleAdjustment/sintel_trailer-1080p.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Elephant\'s Dream',
        property: '',
        caption: '',
        attribution: '(c) Copyright 2006, Blender Foundation / Netherlands Media Art Institute / www.elephantsdream.org',
        baseUrl: 'http://wams.edgesuite.net/media/MPTExpressionData01_SeekDemo/ElephantsDream_1080p24_IYUV_2ch.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Child of the 90s',
        property: 'Captioned',
        caption: 'captions/90s_Captions.ttml',
        attribution: 'You grew up. So did we. Reconnect with the new Internet Explorer.',
        baseUrl: 'http://wams.edgesuite.net/media/90s/90s.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Sintel Trailer',
        property: '',
        caption: '',
        attribution: '(c) Copyright Blender Foundation | www.sintel.org',
        baseUrl: 'http://wams.edgesuite.net/media/SintelTrailer_Smooth_SeekDemo/sintel_trailer-1080p.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }, {
        title: 'Tears of Steel',
        property: 'Protected',
        caption: '',
        attribution: '(c) Copyright Blender Foundation | mango.blender.org',
        baseUrl: 'http://wams.edgesuite.net/media/Tears_of_Steel_Smooth_1080p_Protected2/tears_of_steel_1080p.ism',
        fileName: 'manifest(format=mpd-time-csf)'
    }];

    window.webkitRequired = false;

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
                        throw 'XHR failed (' + url + '). Status: ' + xhr.status + ' (' + xhr.statusText + ')';
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

    function toggleEMENotice(on)
    {
        var elem = document.getElementById("emeNotice");
        if (!elem) {
            elem = document.createElement("div");
            elem.id = "emeNotice";
            video.parentNode.insertBefore(elem, video);
        }
        if (on)
        {
            elem.innerHTML = "Using unprefixed EME and PlayReady services.";
        }
        else
        {
            elem.innerHTML = "Your browser does not support unprefixed EME. Using prefixed EME and PlayReady services.";
        }
    }

    // PlayReady Manager
    var PlayReadyManager = function (vid) {

        this.vid = vid;
        var that = this;

        if (window.navigator.requestMediaKeySystemAccess) {
            toggleEMENotice(true);
            // EME V2 (EdgeHTML+)
            var p = this.createMediaKeySystemAccess();
            p.catch(function () { console.log("Your browser/system doesn't support the required capabilities.") });
            p.then(function (keySystemAccess) {
                that.licenseUrl = 'http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1';
                return keySystemAccess.createMediaKeys();
            }).then(function (createdMediaKeys) {
                that.mediaKeys = createdMediaKeys;
                video.setMediaKeys(createdMediaKeys);
                vid.addEventListener('encrypted', that.onencryptedRequest, false);
            });
        }
        else {
            toggleEMENotice(false);
            // EME V1 (MSHTML)
            vid.addEventListener('msneedkey', function (e) {
                that.needNewPrefixedKey(e);
            }, false);

        }
    };

    PlayReadyManager.prototype = {
        vid: null,
        mediaKeys : null,
        licenseUrl: "",
        onencryptedRequest: function (e) {
               this.playReadyManager.needNewKey(this.playReadyManager.mediaKeys, e.initDataType, e.initData);
            },
        createMediaKeySystemAccess: function (initDataType, initData) {
            return window.navigator.requestMediaKeySystemAccess(
                "com.microsoft.playready",
                 [
                    {
                        initDataTypes: ["keyids", "cenc"],
                        audioCapabilities:
                        [
                            {
                                contentType: "audio/mp4; codecs='mp4a'"
                            }
                        ],
                        videoCapabilities:
                        [
                            {
                                contentType: "video/mp4; codecs='avc1'"
                            }
                        ]

                    }
                ])
        },
        clearEvents: function () {
            video.removeEventListener("encrypted", this.onencryptedRequest, false);
        },
        downloadNewKey: function (url, keyMessage, callback) {
            var keyMessageXml = new DOMParser().parseFromString(String.fromCharCode.apply(null, new Uint16Array(keyMessage)), 'application/xml');
            var challenge;
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
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url);
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
            for (var i = 0; i < headerNames.length; i++) {
                xhr.setRequestHeader(headerNames[i].childNodes[0].nodeValue, headerValues[i].childNodes[0].nodeValue);
            }
            xhr.send(challenge);
        },
        needNewKey: function (mediaKeys, initDataType, initData) {
            var that = this;
            var keySession = mediaKeys.createSession();
            keySession.addEventListener("message", function (event) {
                that.downloadNewKey(that.licenseUrl, event.message, function(data) {
                    event.target.update(data);
                });
            }, false);
            keySession.generateRequest(initDataType, initData).catch(
                console.error.bind(console, 'Unable to create or initialize key session')
                );
        },
        needNewPrefixedKey : function (e) {
            var key_system = 'com.microsoft.playready';
            var that = this;
            if (!video.msKeys) {
                try {
                    /* eslint-disable no-undef */
                    video.msSetMediaKeys(new MSMediaKeys(key_system));
                    /* eslint-enable no-undef */
                } catch (ex) {
                    throw 'Unable to create MediaKeys("' + key_system + '"). Verify the components are installed and functional. Original error: ' + ex.message;
                }
            } else {
                return;
            }
            var session = video.msKeys.createSession('video/mp4', e.initData);
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

    var showUpgradeNotice = function (text, allowDismiss) {
        var errorElem = document.getElementById("error-display");
        errorElem.appendChild(document.createTextNode(text));
        errorElem.style.display = "block";
    };

    var writeError = function (msg, allowDismiss) {
        showUpgradeNotice(msg, allowDismiss);
    };

    var detectMSESupport = function () {
        // Check for MediaSource support
        if (window.MediaSource) {
            mseSupported = true;
            window.webkitRequired = false;
            //  Else, check for WebKitMediaSource AND appendBuffer support (for up to date MSE)
        } else if (window.WebKitMediaSource) {
            mseSupported = true;
            window.webkitRequired = true;
            if (!window.WebKitSourceBuffer.prototype.appendBuffer) {
                mseSupported = false;
                writeError('Your browser does not support the most recent version of Media Source Extensions and is unable to play these videos.', true);
            }
            //  Else, no MSE
        } else {
            mseSupported = false;
            writeError('Your browser does not support Media Source Extensions and is unable to play these videos.', true);
        }
    };
    //==============================================================================
    // Kickoff
    //==============================================================================

    // Check for MSE support
    detectMSESupport();

    var setLock = function (locked) {
        if (locked) {
            openlock.style.display = 'none';
            closedlock.style.display = 'inline-block';
        } else {
            openlock.style.display = 'inline-block';
            closedlock.style.display = 'none';
        }
    };

    video.addEventListener('error', function () {
        if (video.error.msExtendedCode) {
            throw 'Unexpected \'error\' event from media element. Code: ' + prettyPrintMediaError(video.error.code) + ', msExtendedCode: ' + prettyPrintHex(video.error.msExtendedCode);
        } else {
            throw 'Unexpected \'error\' event from media element. Code: ' + prettyPrintMediaError(video.error.code);
        }
    }, false);

    var defaultVideo = false;
    var selectedVideo = -1;

    // Wire up EME key requests and padlock UI.
    video.addEventListener("msneedkey", function () {
        setLock(true);
    }, false);
    video.addEventListener("encrypted", function () {
        setLock(true);
    }, false);

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
            if (video.playReadyManager) {
                video.playReadyManager.clearEvents();
            }
            video.playReadyManager = new PlayReadyManager(video);
            player = new Player(video, mse, manifest);

            // Configure UI controls.
            setLock(false);
            bitrateSlider.max = manifest.videoStreams.length - 1;
            bitrateSlider.value = bitrateSlider.max / 3;
            bitrateSlider.onchange = (function () {
                var change = function () {
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
                    document.getElementById('video' + selectedVideo).removeAttribute("selected");
                }
                defaultVideo = false;
                selectedVideo = index;
                document.getElementById('video' + selectedVideo).setAttribute("selected");
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
                    document.getElementById('video' + selectedVideo).style.opacity = '1';
                    loadVideo(selectedVideo);
                }
            }
        }
    };
    gatherVideos();
} ());
