'use strict';

angular.module('ceaselessLite')
  .controller('ImportSubscribersCtrl', function ($scope, $modalInstance, MemberModel, UserService, SubscriberModel, members) {
    var subscribers = SubscriberModel.get({object: UserService.auth.userId}, function () {
      var allSubscribers = _.compact(subscribers.subscribers).reverse();

      // filter out any subscribers who are already members via e-mail
      $scope.subscribersNotPrayedFor = _.filter(allSubscribers, function (subscriber) {
        var existingMember = _.find(members, {email: subscriber.email});
        return !_.isObject(existingMember);
      });

      $scope.numberOfSubscribersPrayedFor = _.size(allSubscribers) - _.size($scope.subscribersNotPrayedFor);
    });

    var saveMember = function (member) {
      var splitName = member.name.split(' ');
      // need to adjust the subscriber info into member info
      // particularly the name
      if (_.size(splitName) < 2) {
        member.firstName = member.name
      } else {
        member.firstName = splitName.shift();
        member.lastName = splitName.join(' ');
      }

      member.links = {
        owner: UserService.auth.userId
      };

      delete member.id;

      var newMember = new MemberModel(member);
      newMember.$save(function () {
        _.assign(member, newMember.members[0]);
      });

      return member;
    };

    $scope.save = function () {
      var membersToAdd = _.where($scope.subscribersNotPrayedFor, {addToMembers: true});
      var addedMembers = _.map(membersToAdd, saveMember);
      $modalInstance.close(addedMembers);
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

  });
