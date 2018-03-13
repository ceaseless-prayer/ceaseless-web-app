'use strict';

angular.module('ceaselessLite')
.controller('AddMemberCtrl', function ($scope, $modalInstance, UserService, WebcamService) {
  $scope.editedMember = {
    links : {
      owner: UserService.auth.userId
    }
  };

  $scope.save = function () {
    $modalInstance.close($scope.editedMember);
  };

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };

  WebcamService.init($scope);
});
