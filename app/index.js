'use strict';

/**
 * This defines the routes for the application.
 */
angular.module('ceaselessLite', [
    'appConfig',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'ceaselessLite.i18n',
    'ceaselessLite.config',
    'ceaselessLite.scripture',
    'http-auth-interceptor',
    'angularSpinner',
    'webcam'
    ])
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'home/home.html',
    controller: 'HomeCtrl'
  })
  .when('/members', {
    templateUrl: 'members/members.html',
    controller: 'MembersCtrl'
  })
  .when('/intercessors', {
    templateUrl: 'intercessors/intercessors.html',
    controller: 'IntercessorsCtrl'
  })
  .when('/help', {
    templateUrl: 'help/help.html',
    controller: 'HelpCtrl'
  })
  .when('/configuration', {
    templateUrl: 'configuration/configuration.html',
    controller: 'ConfigurationCtrl'
  })
  .when('/login', {
    templateUrl: 'user/login.html'
  })
  .when('/daily', {
    templateUrl: 'daily/daily.html',
    controller: 'DailyCtrl'
  })
  .when('/prayed', {
    templateUrl: 'prayerRecord/prayed.html',
    controller: 'PrayedCtrl'
  })
  .when('/userProfile', {
    templateUrl: 'profile/self.html',
    controller: 'SelfProfileCtrl'
  });
})

.directive('selectedFile', function () {
  return {
    scope: {
      selectedFile : '='
    },
    link: function (scope, element, attributes) {
      element.bind('change', function (changeEvent) {
        scope.$apply(function() {
          scope.selectedFile = changeEvent.target.files[0];
          // or all selected files:
          // scope.fileread = changeEvent.target.files;
        });
      });
    }
  };
});
