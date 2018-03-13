'use strict';

angular.module('ceaselessLite')
  .controller('PrayedCtrl', function ($scope, $http, $routeParams, MessageModel, APP_CONFIG) {
    // Get author details.
    var authorIds = $routeParams.authorIds || [];
    $scope.sender = $routeParams.srcEmail;

    $http.get(APP_CONFIG.apiEndpoint+'prayedFor', {params: {authorIds: authorIds}})
      .success(function (data) {
        $scope.authors = data;
      })
      .error(function (error) {
        console.log('error fetching profile data', error);
      });

    $scope.authors = [];

    // initialize model for new message
    $scope.newMessage = {
      timestamp: null, // the server sets the timestamp.
      sender: $scope.sender,
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

    $scope.saveMessage = function (author, message) {
      if (!_.isEmpty(message)) {
        var newMessage = _.clone($scope.newMessage, true);
        newMessage.content = message;
        newMessage.links.user = author.id;
        createMessage(newMessage);
        $scope.messageSaved = true;
      }
    };
  });