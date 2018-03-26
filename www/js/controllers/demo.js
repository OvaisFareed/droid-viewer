angular.module('starter')

    .controller('DemoCtrl', function ($scope, $http, $state, $ionicPopup, $firebaseArray, SERVER_BASE_URL, FIREBASE_URL) {
        var apiKey = "", sessionId = "", token = "", session, sessionConnected = false;
        var alphabets = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var shortId_length = 8;
        var auth = firebase.auth();
        var storageRef = firebase.storage().ref();
        var messagesRef = new Firebase(FIREBASE_URL + '/messages');
        var filesRef = new Firebase(FIREBASE_URL + '/files');
        $scope.messages = $firebaseArray(messagesRef);
        $scope.files = $firebaseArray(filesRef);
        $scope.dummyCouponCode = '';
        $scope.requestInProgress = false;
        $scope.text = '';

        // initialize Controller
        $scope.initializeCtrl = function (callFrom) {
            if (callFrom == 'Home' || callFrom == 'Chat') {
                generateDummyCouponCode();
            }
            else if (callFrom == 'fileShare') {
                document.getElementById('file').addEventListener('change', handleFileSelect, false);
            }
            $http.get(SERVER_BASE_URL + '/session')
                .then(function (res) {
                    apiKey = res.data.apiKey;
                    sessionId = res.data.sessionId;
                    token = res.data.token;
                })
                .catch(handleError);
        }

        // start Video Call
        $scope.startVideoCall = function () {
            $scope.requestInProgress = true;
            initializeSession(apiKey, sessionId);
        }

        // end Video Call
        $scope.endVideoCall = function(){
            session.disconnect();
            $scope.requestInProgress = false;
        }

        /*
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
        */

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

            session.on("sessionDisconnected", function(event) {
                console.log("The session disconnected. " + event.reason);
                $scope.requestInProgress = false;         
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

        // share your Unique Id on social media
        $scope.share = function (t, msg, img, link) {
            if (t == 'w')
                cordova.plugins.socialsharing
                    .shareViaWhatsApp(msg, '', link);
            else if (t == 'f')
                window.plugins.socialsharing
                    .shareViaFacebook(msg, img, link);
            else if (t == 't')
                window.plugins.socialsharing
                    .shareViaTwitter(msg, img, link);
            else if (t == 'sms')
                window.plugins.socialsharing
                    .shareViaSMS(msg + ' ' + img + ' ' + link);
            else {
                var sub = 'Beautiful images inside ..';
                window.plugins.socialsharing
                    .shareViaEmail(msg, sub, '');
            }
        }

        // generate Dummy Coupon Code
        function generateDummyCouponCode() {
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

        // Adds new message
        $scope.addMessage = function () {
            $scope.messages.$add({
                "text": $scope.text,
                "id": $scope.dummyCouponCode
            });
            $scope.text = '';
        };

        $scope.deleteAll = function (ref) {
            $ionicPopup.show({
                title: 'Do you really want to Delete all?',
                subTitle: ref,
                scope: $scope,
                buttons: [
                  { text: 'Cancel', onTap: function(e) { return false; } },
                  {
                    text: '<b>Delete</b>',
                    type: 'button-assertive',
                    onTap: function(e) {
                      return true;
                    }
                  },
                ]
                }).then(function(res) {
                    if(res){
                        var deleteRef = (ref == 'Files')  ? filesRef : messagesRef;
                        deleteRef.remove();                        
                    }
                  console.log('Tapped!', res);
                }, function(err) {
                  console.log('Err:', err);
                }, function(msg) {
                  console.log('message:', msg);
                });
        }

        // uploads file to firebase storage
        function handleFileSelect(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var file = evt.target.files[0];
            var metadata = {
                'contentType': file.type
            };
            storageRef.child('images/' + file.name).put(file, metadata).then(function (snapshot) {
                console.log('Uploaded', snapshot.totalBytes, 'bytes.');
                console.log(snapshot.metadata);
                var url = snapshot.downloadURL;
                console.log('File available at', url);
                $scope.files.$add({
                    name: file.name,
                    downloadURL: url,
                    type: file.type
                })
            }).catch(function (error) {
                console.error('Upload failed:', error);
            });
        }

        /*
        $scope.logout = function () {
            var ref = new Firebase(FIREBASE_URL);
            ref.unauth();
            $state.go('home');
        };
        */
    });