'use strict';

angular.module('ceaselessLite')
.factory('UserService', function ($q, $injector, APP_CONFIG, authService, $cookieStore, $location) {

  var auth = {
    user: null,
    userId: null,
    authorization: ''
  };

  var isAuthenticated = function () {
    return !!auth.user;
  };

  var authFromCookie = $cookieStore.get('auth');
  if (!_.isEmpty(authFromCookie)) {
    auth = authFromCookie;
  }

  var login = function (name, password) {
    return $injector.get('$http').post(APP_CONFIG.authenticate, {
      name: name,
      password: password
    }).success(function (response) {
      auth.authorization = response.value;
      auth.userId = response.links.owner;
      auth.user = name;
      auth.identities = response.identities;
      // TODO ensure cookie is only being transmitted to API endpoint
      // or that it is not being transmitted at all.
      $cookieStore.put('auth', auth);
      authService.loginConfirmed();
    }).error(function (error) {
      throw error;
    });
  };

  var logout = function () {
    var cleanup = function () {
      auth.user = null;
      auth.userId = null;
      auth.authorization = '';
      $cookieStore.remove('auth');
    };
    return $injector.get('$http').post(APP_CONFIG.logout, {})
      .success(function (response) {
        cleanup();
        $location.path('/'); // take the user to the homepage.
    }).error(function (error) {
      cleanup();
      $location.path('/'); // take the user to the homepage.
      throw error;
    });
  };

  var forgotPassword = function () {
    return $injector.get('$http').post(APP_CONFIG.forgotPassword, {});
  };

  return {
    isAuthenticated: isAuthenticated,
    auth: auth,
    login: login,
    logout: logout,
    forgotPassword: forgotPassword
  };
})
.factory('authorizationInterceptor', function ($q, UserService, APP_CONFIG) {
  return {
    'request': function (config) {
        // TODO when the latest version of lodash supports startsWith
        // drop this definition.
        _.startsWith = function (hay, needle) {
          return hay.indexOf(needle) === 0;
        };

        // ensure the auth interceptor isn't applied if the user fails to login
        // since that would be redundant (reshow the login form).
        if (_.startsWith(config.url, APP_CONFIG.authenticate)) {
          config.ignoreAuthModule = true;
        } else {
          // include the authorization header if we are hitting our API.
          // and only if user is authenticated
          if (UserService.isAuthenticated() && _.startsWith(config.url, APP_CONFIG.apiEndpoint)) {
            config.headers.Authorization = UserService.auth.authorization;
          }
        }

        return config || $q.when(config);
      }
  };
})
// to use an instance of the interceptor, we have to pass it in as a
// string because the config block doesn't directly accept instances.
.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('authorizationInterceptor');
}]);
