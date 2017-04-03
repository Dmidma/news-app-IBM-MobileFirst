(function() {

var app = angular.module('starter', [
  'ionic', 
  'starter.controllers', 
  'starter.services', 
  'weather.controller',
  'news.controller',
  'starter.newsservice',
  'lock.controller',
  'starter.weatherservice'
]);



app.run(function($ionicPlatform, $state) {


  $ionicPlatform.ready(function() {
   
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

      
    // change the default behavior of target=_blank

    // Note it does not take a target!
    var systemOpen = function(url, options) {
      window.open(url, "_system", options);
    };

    // Handle html links like <a href="url" target="_blank">
    // See https://issues.apache.org/jira/browse/CB-6747
    $(document).on('click', 'a[target=_blank]', function(event) {
      event.preventDefault();
      systemOpen($(this).attr('href'));
    });


    /*
    // fix this Dmidma
    // make the client logout if the application is closed
    document.addEventListener("offline", function() {
        
      console.log(WL.Client.getLoginName("SingleStepAuthRealm"));

      WL.Client.logout("SingleStepAuthRealm");
      
      console.log(WL.Client.getLoginName("SingleStepAuthRealm"));

      //WL.Client.reloadApp();
      //$state.go("lock");
    });
    */
   
   
  });
});


app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider


  // lock State
  .state('lock', {
    url: '/lock',
    templateUrl: 'templates/lock.html',
    controller: 'LockCtrl'
  })

  // signup page
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SingupCtrl'
  })

  // login state
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })


  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: "AppCtrl"
  })

  // setup an abstract state for the tabs directive
    .state('app.tab', {
    url: '/tab',
    views: {
      'menuContent': {
        templateUrl: 'templates/tabs.html' 
      }
    }
  })

  .state('app.filterNews', {
    url: '/filter',
    views: {
      'menuContent': {
        templateUrl: 'templates/filter-news.html',
        controller: 'filerNewsCtrl'
      }
    }
  })

  // Each tab has its own nav history stack:

  // Home section
  .state('app.tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
      }
    }
  })  

  .state('app.tab.news-detail', {
      url: '/dash/:newsId',
      views: {
        'tab-dash': {
          templateUrl: 'templates/news-details.html',
          controller: 'newController'
        }
      }
  })

  .state('app.tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })

    .state('app.tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('app.tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'DashCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/lock');
});
})();
