'use strict';

/*
 * Bootstrap the application after the client configuration is loaded.
 */
(function() {
  var initInjector = angular.injector(['ng']);
  var $http = initInjector.get('$http');
  $http.get('config.json').then(
    function (response) {
      angular.module('appConfig', []).constant('APP_CONFIG', response.data.integ);
      angular.element(document).ready(function() {
        angular.bootstrap(document, ['ceaselessLite']);
      });
    });
})();