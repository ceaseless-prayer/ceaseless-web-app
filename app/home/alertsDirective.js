'use strict';
/**
 * This directive will show any alerts in scope.
 **/
angular.module('ceaselessLite')
    .directive('showAlerts', function () {
      return {
        replace: true,
        restrict: 'E',
        template: '<alert ng-repeat="alert in alerts" type="alert.type" close="closeAlert($index)">{{alert.msg}}</alert>'
      };
    });
