
/* JavaScript content from js/bak_js/app.bak.js in folder common */
(function() {

var app = angular.module('starter', [
  'ionic', 
  'starter.controllers', 
  'starter.services', 
  'weather.controller',
  'news.controller',
  'starter.newsservice',
]);



app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      console.log("here");
    }
    else {
      console.log("Here");
    }
    
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

      
      // change the default behavior of target=_blank
      // waw !!!

      if ( typeof cordova === "undefined" || !cordova.InAppBrowser ) {
        throw new Error("You are trying to run this code for a non-cordova project, " +
                "or did not install the cordova InAppBrowser plugin");
      }

      // Currently (for retrocompatibility reasons) the plugin automagically wrap window.open
      // We don't want the plugin to always be run: we want to call it explicitly when needed
      // See https://issues.apache.org/jira/browse/CB-9573
      delete window.open; // scary, but it just sets back to the default window.open behavior
      var windowOpen = window.open; // Yes it is not deleted !

      // Note it does not take a target!
      var systemOpen = function(url, options) {
        // Do not use window.open becaus the InAppBrowser open will not proxy window.open
        // in the future versions of the plugin (see doc) so it is safer to call InAppBrowser.open directly
        //cordova.InAppBrowser.open(url,"_system",options);
        window.open(ulr, "_system", options);
      };


      // Handle direct calls like window.open("url","_blank")
      window.open = function(url,target,options) {
        if ( target == "_blank" ) systemOpen(url,options);
        else windowOpen(url,target,options);
      };

      // Handle html links like <a href="url" target="_blank">
      // See https://issues.apache.org/jira/browse/CB-6747
      $(document).on('click', 'a[target=_blank]', function(event) {
        event.preventDefault();
        systemOpen($(this).attr('href'));
      });
    

  });
});


app.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // login state
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  // Home section
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })  

  .state('tab.news-detail', {
      url: '/dash/:newsId',
      views: {
        'tab-dash': {
          templateUrl: 'templates/news-details.html',
          controller: 'newController'
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
  $urlRouterProvider.otherwise('/login');
});
})();