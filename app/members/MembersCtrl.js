'use strict';

angular.module('ceaselessLite')
.controller('MembersCtrl', function ($scope, $modal, $http, MemberModel, PrayerService) {

  var saveMember = function (member) {
    var newMember = new MemberModel(member);
    newMember.$save(function () {
      _.assign(member, newMember.members[0]);
    });
    $scope.members.push(member);
  };

  $scope.openAddMemberForm = function () {
    var modalInstance = $modal.open({
      templateUrl: 'members/addMemberForm.html',
        controller: 'AddMemberCtrl',
        windowClass: 'member-form'
    });

    modalInstance.result.then(saveMember, function () {});
  };

  $scope.openBulkUploadMembersForm = function () {
    var modalInstance = $modal.open({
      templateUrl: 'members/bulkUploadMembersForm.html',
      controller: 'BulkUploadMembersCtrl',
      windowClass: 'member-form'
    });

    modalInstance.result
      .then(function (membersList) {
        $scope.members = $scope.members.concat(membersList);
      }, function () {});
  };

  $scope.openImportSubscribersForm = function () {
    var modalInstance = $modal.open({
      templateUrl: 'members/importSubscribersForm.html',
      controller: 'ImportSubscribersCtrl',
      windowClass: 'member-form',
      resolve: {
        members: function () {
          return $scope.members;
        }
      }
    });

    modalInstance.result
      .then(function (membersList) {
        $scope.members = $scope.members.concat(membersList);
      }, function () {});
  };

  var members = MemberModel.query(function () {
    $scope.members = members.members;
  });

  $scope.clickEffect = function (member) {
    var modalInstance = $modal.open({
      templateUrl: 'members/memberDetail.html',
      controller: 'MemberDetailCtrl',
      resolve: {
        member: function () {
                return member;
              }
      },
      windowClass: 'member-form'
    });

    modalInstance.result.then(function (action) {
      var indexToUpdate = _.findIndex($scope.members, function (i) {
        return i.id === action.member.id;
      });
      switch (action.action) {
        case 'delete':
          $scope.members.splice(indexToUpdate, 1);
          break;
        case 'close':
          $scope.members[indexToUpdate] = action.member;
          break;
      }

    }, function () {
    });
  };

  $scope.prayed = PrayerService.prayed;
});

