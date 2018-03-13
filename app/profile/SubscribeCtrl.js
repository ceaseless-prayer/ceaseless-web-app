'use strict';

angular.module('ceaselessLite')
.controller('SubscribeCtrl', function ($scope, $modalInstance, UserService, WebcamService) {
  $scope.subscriber = {};
  $scope.save = function (profilePicture) {
    if (!_.isEmpty(profilePicture)) {
      loadImage.parseMetaData(profilePicture, function (data) {

        var orientation = 1;
        if(data.exif) {
          orientation = data.exif.get('Orientation') || 1;
        }

        loadImage(profilePicture, function (thumbnail) {
          $scope.subscriber.profilePictureSnapshot = thumbnail.toDataURL();
          $modalInstance.close($scope.subscriber);
        }, {
          maxWidth: 300,
          maxHeight: 300,
          canvas: 1, // returns a canvas
          orientation: Number(orientation)
        });
      });
    } else {
      $modalInstance.close($scope.subscriber);
    }
  };

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };

  WebcamService.init($scope);
});
