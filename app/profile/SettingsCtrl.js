'use strict';

angular.module('ceaselessLite')
.controller('SettingsCtrl', function ($scope, $modalInstance, UserService, UserModel, WebcamService) {

  new UserModel({id: UserService.auth.userId}).$get(function (users) {
    $scope.user = users.users[0];
  });

  var saveUserSettings = function (user) {
    new UserModel(user).$update({}, function () {
      $modalInstance.close(user);
    });
  };

  $scope.save = function (profilePicture) {
    if (!_.isEmpty(profilePicture)) {
      loadImage.parseMetaData(profilePicture, function (data) {

        var orientation = 1;
        if(data.exif) {
          orientation = data.exif.get('Orientation') || 1;
        }

        loadImage(profilePicture, function (thumbnail) {
          $scope.user.profilePictureSnapshot = thumbnail.toDataURL();
          saveUserSettings($scope.user);
        }, {
          maxWidth: 300,
          maxHeight: 300,
          canvas: 1, // returns a canvas
          orientation: Number(orientation)
        });
      });
    } else {
      console.log($scope.user);
      saveUserSettings($scope.user);
    }
  };

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };

  WebcamService.init($scope);
});
