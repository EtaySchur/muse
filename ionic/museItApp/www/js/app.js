// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services' , 'elasticsearch'   , 'ui.router' ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})



.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
      .state('login', {
          url: '/login',
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'

      })
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })



  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});


app.config( function ($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});
/*
app.run(function () {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    console.log("running you tube script");
});
*/

app.service('es', function (esFactory) {
    return esFactory({ host: 'localhost:9200' });
});

app.directive('youtube', function($window , $rootScope) {
    return {
        restrict: "E",

        scope: {
            height:   "@",
            width:    "@",
            videoId:  "@"
        },

        template: '<div></div>',

        link: function(scope, element) {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            $rootScope.$on('changeVideo' , function(event , data){
                scope.videoid = data.id;
            });

            $rootScope.$on('playVideo' , function(event , data){
                player.playVideo();
            });

            $rootScope.$on('pauseVideo' , function(event , data){
                player.pauseVideo();
            });

            $rootScope.$on('stopVideo' , function(event , data){
                player.seekTo(0);
                player.stopVideo();
            });


            var player;

            scope.$watch('videoid', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                console.log("IM WATChING !!!");
                player.cueVideoById(scope.videoid);

            });

            scope.$watch('height + width', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }

                player.setSize(scope.width, scope.height);

            });



            $window.onYouTubeIframeAPIReady = function() {
                player = new YT.Player(element.children()[0], {

                    playerVars: {
                        autoplay: 1,
                        html5: 1,
                        theme: "light",
                        modesbranding: 0,
                        color: "white",
                        iv_load_policy: 3,
                        showinfo: 1,
                        controls: 1,
                    },

                    height: scope.height,
                    width: scope.width,
                    videoId: scope.videoid
                });
            };
        },
    }
});


