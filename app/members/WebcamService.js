'use strict';

angular.module('ceaselessLite')
.service('WebcamService', function () {

  var WebcamService = function() {};

  WebcamService.prototype.init = function($scope) {

    // Webcam snapshot code
    var _video, patOpts = {};

    $scope.onStreamingPermission = function (videoElem) {
      // The video element contains the captured camera data
      _video = videoElem;
      $scope.$apply(function() {
        patOpts.w = _video.width;
        patOpts.h = _video.height;
        $scope.hasWebcamPermission = true;
      });
    };

    $scope.takeSnapshot = function() {
      var hiddenCanvas = document.createElement('canvas');
      hiddenCanvas.width = _video.width;
      hiddenCanvas.height = _video.height;
      var ctx = hiddenCanvas.getContext('2d');
      ctx.drawImage(_video, 0, 0, _video.width, _video.height);
      $scope.editedMember.profilePictureSnapshot = hiddenCanvas.toDataURL();
    };

    // End of Webcam snapshot code
  };

  return new WebcamService();
});
