'use strict';

/**
 * See this {@link http://stackoverflow.com/questions/14774486/use-jquery-timeago-or-momentjs-and-angularjs-together}
 * for more information
 */
angular.module('ceaselessLite')
  .service('MomentService', function ($window) {
    return $window.moment;
  })
  .filter('fromNow', function(MomentService) {
    return function(date) {
      return new MomentService(date).fromNow();
    };
});