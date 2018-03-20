// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

  .constant('SERVER_BASE_URL', 'https://droid-viewer.herokuapp.com')
  .constant('FIREBASE_URL', "https://droid-viewer.firebaseio.com")

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    })
  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $stateProvider
      // setup an abstract state for the tabs directive
      
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'views/tabs.html'
      })


      // Each tab has its own nav history stack:

      .state('tab.dash', {
        url: '/',
        views: {
          'tab-dash': {
            templateUrl: 'views/home.html',
            controller: 'DemoCtrl',            
            data: {
              css: 'css/home.css'
            }
          }
        }
      })

      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'views/chat.html',
            controller: 'DemoCtrl',
            data: {
              css: 'css/chat.css'
            }
          }
        }
      })
    
    
      .state('tab.social', {
        url: '/social',
        views: {
          'tab-social': {
            templateUrl: 'views/connect.html',
            controller: 'DemoCtrl',
            data: {
              css: 'css/style.css'
            }
          }
        }
      })
    
      .state('tab.share', {
        url: '/file-sharing',
        views: {
          'tab-file-sharing': {
            templateUrl: 'views/fileShare.html',
            controller: 'DemoCtrl',
            data: {
              css: 'css/style.css'
            }
          }
        }
      })
      
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/');
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
  })