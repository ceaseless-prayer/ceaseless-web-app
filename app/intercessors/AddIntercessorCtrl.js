'use strict';

angular.module('ceaselessLite')
.controller('AddIntercessorCtrl', function ($scope, $modalInstance, UserService) {
  $scope.newIntercessor = {};
  $scope.newIntercessor.links = {
    owner: UserService.auth.userId
  };

  $scope.ok = function () {
    $modalInstance.close($scope.newIntercessor);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
