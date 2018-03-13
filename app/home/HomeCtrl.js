'use strict';

angular.module('ceaselessLite')
.controller('HomeCtrl', function ($scope, $resource, UserModel, $rootScope) {
  $scope.signup = {};
  $scope.alerts = [];
  $scope.registerUser = function () {
    // try to add user to the database
    var newUser = new UserModel($scope.signup);
    var user = $scope.signup;

    newUser.$save(function () {
      _.assign(user, newUser.users[0]);
      // if it succeeds
      // redirect to login page.
      $rootScope.$broadcast('event:auth-loginRequired');
    }, function () {
      // if it fails, notify the user
      $scope.alerts.push({msg: 'could not create user', type: 'danger'});
    });
  };
});
