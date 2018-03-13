'use strict';

angular.module('ceaselessLite')
.controller('MessagesCtrl', function ($scope, $modalInstance, $http, UserService, SubscriberModel, MessageModel) {

  $scope.deleteMessage = function (id) {
    var messageToDelete = new MessageModel({id:id});
    messageToDelete.$delete();
    var indexToMessage = _.findIndex($scope.messages, function (i) {
      return i.id === id;
    });
    $scope.messages.splice(indexToMessage, 1);
  };

  var subscriberCache = {};

  var messages = MessageModel.get({user: UserService.auth.userId}, function () {
    $scope.messages = messages.messages.reverse();
    _.each($scope.messages, function (message) {

      // TODO make this more efficient
      // fetch subscriber details
      SubscriberModel.get({email:message.sender}, function (subscribers) {
        if(!_.isEmpty(_.compact(subscribers.subscribers))) {
          message.subscriber = subscribers.subscribers[0];
          subscriberCache[message.sender] = message.subscriber;
        }
      });
    });
  });

  $scope.close = function () {
    $modalInstance.dismiss('cancel');
  };
});

