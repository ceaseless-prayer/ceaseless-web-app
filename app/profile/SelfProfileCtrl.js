/*global moment */

'use strict';

angular.module('ceaselessLite')
.controller('SelfProfileCtrl', function ($scope, $routeParams, $http, $modal,
                                         $location,
                                         UserService, UserModel, PrayerUpdateModel,
                                         SubscriberModel, APP_CONFIG) {
  $scope.feed = [];
  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  // Get user details.
  var profileId = $routeParams.id ? $routeParams.id : UserService.auth.userId;


  $http.get(APP_CONFIG.apiEndpoint+'publicProfile', {params: {id: profileId}})
    .success(function (data) {
      if (_.isEmpty($routeParams.id)) {
        $location.search({id: UserService.auth.userId});
      }
      $scope.profile = data;
    })
    .error(function (error) {
      console.log('error fetching profile data', error);
    });


  $scope.openSubscribeDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: 'profile/subscribe.html',
      controller: 'SubscribeCtrl',
      windowClass: 'subscriber-form'
    });

    modalInstance.result.then(addSubscriber, function (err) {console.log(err);});
  };

  $scope.openMessageDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: 'profile/createMessageForm.html',
      controller: 'CreateMessageCtrl',
      windowClass: 'message-form',
      resolve: {
        receiverId: function () {
          return profileId;
        }
      }
    });

    modalInstance.result.then(function () {$scope.alerts.push({msg: 'Message sent', type: 'success'})},
      function (err) {console.log(err);});
  };

  var addSubscriber = function (subscriber) {
    subscriber.links = {
      object: profileId
    };
    var newSubscriber = new SubscriberModel(subscriber);
    newSubscriber.$save(function () {
      _.assign(subscriber, newSubscriber.subscribers[0]);
    });

    return subscriber;
  };

  $scope.showSubscribersDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: 'profile/subscribers.html',
      controller: 'SubscribersCtrl',
      windowClass: 'subscriber-list'
    });
  };

  $scope.showMessagesDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: 'profile/messages.html',
      controller: 'MessagesCtrl',
      windowClass: 'message-list'
    });
  };

  $scope.openSettingsDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: 'profile/settings.html',
      controller: 'SettingsCtrl',
      windowClass: 'settings'
    });
  };

  // get user updates
  var updates = PrayerUpdateModel.get({author: profileId}, function () {
    //$scope.feed = $scope.feed.concat(updates.prayerUpdates.reverse());
    $scope.feed = _.sortBy(updates.prayerUpdates, 'timestamp').reverse();
  });

  // initialize model for new update
  $scope.newUpdate = {
    timestamp: null, // the server sets the timestamp.
    type: 'update',
    image: null,
    links: {
      author: UserService.auth.userId
    },
    content: ''
  };

  var createUpdate = function (newUpdate) {
    var update = new PrayerUpdateModel(newUpdate);
    update.$save(function () {
      _.assign(newUpdate, update.prayerUpdates[0]);
      $scope.feed.unshift(newUpdate);
      $scope.postingUpdate = false;

    });
    $scope.statusPicture = void 0;
    $scope.prayerUpdate = '';
  };

  $scope.postingUpdate = false;
  $scope.postUpdate = function () {
    // save the update
    $scope.postingUpdate = true;
    if ($scope.prayerUpdate) {
      var newUpdate = _.clone($scope.newUpdate, true);
      newUpdate.content = $scope.prayerUpdate;

      if(!_.isEmpty($scope.statusPicture)) {
        loadImage.parseMetaData($scope.statusPicture, function (data) {

          var orientation = 1;
          if(data.exif) {
            orientation = data.exif.get('Orientation') || 1;
          }

          loadImage($scope.statusPicture, function (thumbnail) {
            newUpdate.image = thumbnail.toDataURL();
            createUpdate(newUpdate);
          }, {
            maxWidth: 400,
            maxHeight: 400,
            canvas: 1, // returns a canvas
            orientation: Number(orientation)
          });
        });
      } else {
        createUpdate(newUpdate);
      }
    }
  };

  $scope.deleteUpdate = function (id) {
    var updateToDelete = new PrayerUpdateModel({id:id});
    updateToDelete.$delete();
    var indexToUpdate = _.findIndex($scope.feed, function (i) {
      return i.id === id;
    });
    $scope.feed.splice(indexToUpdate, 1);
  };

  $scope.isAuthenticated = function () {
    return UserService.isAuthenticated() && UserService.auth.userId == profileId;
  };
});
