'use strict';

angular.module('ceaselessLite')
  .controller('CreateMessageCtrl', function ($scope, $http, $routeParams, $modalInstance, MessageModel, receiverId) {
    // Get author details.
    $scope.message = {};
    $scope.message.sender = $routeParams.srcEmail;
    $scope.form = {};

    // initialize model for new message
    $scope.newMessage = {
      timestamp: null, // the server sets the timestamp.
      sender: null,
      links: {
        user: null
      },
      content: ''
    };

    var createMessage = function (newMessage) {
      var message = new MessageModel(newMessage);
      message.$save(function () {
        _.assign(newMessage, message.messages[0]);
      });
    };

    $scope.send = function () {
      if ($scope.form.createMessage.$valid) {
        var newMessage = _.clone($scope.newMessage, true);
        newMessage.content = $scope.message.content;
        newMessage.sender = $scope.message.sender;
        newMessage.links.user = receiverId;
        createMessage(newMessage);
        $modalInstance.close();
      }
    };
  });