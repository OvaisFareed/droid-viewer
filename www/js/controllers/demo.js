angular.module('starter')

    .controller('DemoCtrl', function ($scope, $http, SERVER_BASE_URL) {
        // Go to https://tokbox.com/account to find your OpenTok
        // API key and generate a test session ID and token:
        var apiKey = "", sessionId = "", token = "", session, sessionConnected = false;
        var alphabets = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var shortId_length = 8;
        $scope.dummyCouponCode = '';
        $scope.requestInProgress = false;

        // initialize Controller
        $scope.initializeCtrl = function (fromHome) {
            $http.get(SERVER_BASE_URL + '/session')
                .then(function (res) {
                    apiKey = res.data.apiKey;
                    sessionId = res.data.sessionId;
                    token = res.data.token;
                })
                .catch(handleError);
                if(fromHome){
                    generateDummyCouponCode();
                }
        }

        // start Video Call
        $scope.startVideoCall = function () {
            $scope.requestInProgress = true;
            initializeSession(apiKey, sessionId);
        }

        // share Screen
        $scope.shareScreen = function () {
            $scope.requestInProgress = true;            
            session = OT.initSession(apiKey, sessionId);

            session.connect(token, function (error) {
                var publisher = OT.initPublisher('camera');
                session.publish(publisher, function () {
                    screenshare();
                });
            });

            session.on('streamCreated', function (event) {
                session.subscribe(event.stream);
            });

            // For Google Chrome only, register your extension by ID. You can
            // find it at chrome://extensions once the extension is installed.
            //
            // The last parameter assumes you are using the latest version (version 2)
            // of the OpenTok Chrome extension source code.
            OT.registerScreenSharingExtension('chrome', 'mffmiagohjomdjboaffalnpggalopmha', 2);

            function screenshare() {
                OT.checkScreenSharingCapability(function (response) {
                    if (!response.supported || response.extensionRegistered === false) {
                        alert('This browser does not support screen sharing.');
                    } else if (response.extensionInstalled === false) {
                        alert('Please install the screen sharing extension and load your app over https.');
                    } else {
                        // Screen sharing is available. Publish the screen.
                        var screenSharingPublisher = OT.initPublisher('screen-preview', { videoSource: 'screen' });
                        session.publish(screenSharingPublisher, function (error) {
                            if (error) {
                                alert('Could not share the screen: ' + error.message);
                            }
                        });
                    }
                });
            }
        }

        // start text chat
        $scope.sendMessage = function () {
            session = OT.initSession(apiKey, sessionId);

            if (!sessionConnected) {
                // Connect to the session
                session.connect(token, function (error) {
                    // If the connection is successful, publish to the session
                    if (error) {
                        handleError(error);
                    }
                    else {
                        sessionConnected = true;
                        send();
                    }
                });
            }
            else {
                send();
            }
            function send() {

                // Receive a message and append it to the history
                var msgHistory = document.querySelector('#history');
                session.on('signal:msg', function signalCallback(event) {
                    var msg = document.createElement('p');
                    msg.textContent = event.data;
                    msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
                    msgHistory.appendChild(msg);
                    msg.scrollIntoView();
                });

                // Text chat
                // var form = document.querySelector('form');
                var msgTxt = document.querySelector('#msgTxt');

                // Send a signal once the user enters data in the form
                session.signal({
                    type: 'msg',
                    data: msgTxt.value
                }, function signalCallback(error) {
                    if (error) {
                        console.error('Error sending signal:', error.name, error.message);
                    } else {
                        msgTxt.value = '';
                    }
                });
            }

        }

        // initialize Session
        
            function initializeSession(apiKey, sessionId) {
                session = OT.initSession(apiKey, sessionId);

                // Subscribe to a newly created stream
                session.on('streamCreated', function (event) {
                    session.subscribe(event.stream, 'subscriber', {
                        insertMode: 'append',
                        width: '100%',
                        height: '100%'
                    }, handleError);
                });

                // Create a publisher
                var publisher = OT.initPublisher('publisher', {
                    insertMode: 'append',
                    width: '100%',
                    height: '100%'
                }, handleError);

                // Connect to the session
                session.connect(token, function (error) {
                    // If the connection is successful, publish to the session
                    if (error) {
                        handleError(error);
                    } else {
                        session.publish(publisher, handleError);
                    }
                });
            }

            $scope.share = function(t, msg, img, link){  
                if(t == 'w')
                    window.plugins.socialsharing
                    .shareViaWhatsApp(msg, '', link);
                else if(t == 'f')
                    window.plugins.socialsharing
                    .shareViaFacebook(msg, img, link);    
                else if(t == 't')
                    window.plugins.socialsharing
                    .shareViaTwitter(msg, img, link);    
                else if(t == 'sms')
                    window.plugins.socialsharing
                    .shareViaSMS(msg+' '+img+' '+link);    
                else
                {
                    var sub = 'Beautiful images inside ..';
                    window.plugins.socialsharing
                    .shareViaEmail(msg, sub, '');        
                }
            }       
            
            // generate Dummy Coupon Code
        function generateDummyCouponCode () {
            for (var i = 0; i < shortId_length; i++) {
                $scope.dummyCouponCode += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
            }
            return $scope.dummyCouponCode;
        }

        // Handling all of our errors here by alerting them
        function handleError(error) {
            if (error) {
                console.log(error.message);
            }
        }
    });