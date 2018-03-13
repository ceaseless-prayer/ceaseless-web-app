'use strict';

angular.module('ceaselessLite')
.controller('LoginCtrl', function ($scope, UserService) {
  $scope.signin = {};
  $scope.forgotPasswordForm = {};
  $scope.alerts = [];

  $scope.submit = function () {
    $scope.alerts = []; // reset alerts
    UserService.login($scope.signin.name, $scope.signin.password)
      .success(function (response){
        console.log('authorized here');
      })
      .error(function (error) {
        $scope.alerts.push({msg: 'login failed', type: 'danger'});
      });
  };

  $scope.forgotPassword = function () {
    $scope.alerts = [];
    UserService.forgotPassword($scope.forgotPasswordForm.name)
      .success(function (response) {
        $scope.showForgotPassword = false;
        $scope.alerts.push({msg: 'password reset link sent', type: 'success'});
      })
      .error(function (error) {
        $scope.alerts.push({msg: 'password reset failed', type: 'danger'});
      });
  };
});
