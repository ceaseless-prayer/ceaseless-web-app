'use strict';

angular.module('ceaselessLite')
  .controller('BulkUploadMembersCtrl', function ($scope, $modalInstance, MemberModel, UserService) {

    $scope.memberKeys = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'gender',
      'facebook',
      'profilePicture',
      'address'
    ];

    $scope.parsedMembers = [];
    $scope.hasParsed = false;

    $scope.parse = function (csvUploading) {
      var fileReader = new FileReader();
      fileReader.onload = function (file) {
        var rows = file.target.result.split(/[\r\n|\n]+/);

        rows = rows.map(function (row) {
          return row.split(',');
        });
        // TODO validation of header row
        // drop the header row
        rows.shift();

        $scope.parsedMembers = _.map(rows, function (row) {
          return _.zipObject($scope.memberKeys, row);
        });
        $scope.hasParsed = true;
        $scope.$apply();
        console.log('$scope.parsedMembers', $scope.parsedMembers);
      };

      fileReader.readAsText(csvUploading);
    };

    var saveMember = function (member) {
      member.links = {
        owner: UserService.auth.userId
      };

      var newMember = new MemberModel(member);
      newMember.$save(function () {
        _.assign(member, newMember.members[0]);
      });
      return member;
    };

    $scope.upload = function () {
      var addedMembers = [];
      _.each($scope.parsedMembers, function (member) {
        addedMembers.push(saveMember(member));
      });

      $modalInstance.close(addedMembers);
    };

    $scope.close = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.clear = function () {
      $scope.hasParsed = false;
      $scope.parsedMembers = [];
    };

  });
