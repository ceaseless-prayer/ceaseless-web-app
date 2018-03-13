'use strict';

angular.module('ceaselessLite')
.filter('profilePicture', function () {
  return function (input) {
    if (_.isEmpty(input)) {
      return 'members/images/default_profile_pic.jpg';
    }
    if(!_.isEmpty(input.profilePicture)) {
      return input.profilePicture;
    }
    if(!_.isEmpty(input.profilePictureSnapshot)) {
      return input.profilePictureSnapshot;
    }
    if(typeof(input) === 'string') {
      return input;
    } else {
      return 'members/images/default_profile_pic.jpg';
    }

  };
});
