'use strict';

angular.module('ceaselessLite')
.controller('SubscribersCtrl', function ($scope, $modalInstance, $http, UserService, SubscriberModel) {

  $scope.deleteSubscriber = function (id) {
    var subscriberToDelete = new SubscriberModel({id:id});
    subscriberToDelete.$delete();
    var indexToSubscriber = _.findIndex($scope.subscribers, function (i) {
      return i.id === id;
    });
    $scope.subscribers.splice(indexToSubscriber, 1);
  };

  var subscribers = SubscriberModel.get({object: UserService.auth.userId}, function () {
    $scope.subscribers = _.compact(subscribers.subscribers).reverse();
  });

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };
});

