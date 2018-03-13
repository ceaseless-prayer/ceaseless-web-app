'use strict';
angular.module('ceaselessLite')
.controller('IntercessorDetailCtrl', function ($scope, $modalInstance, intercessor, IntercessorModel, PrayerRecordModel, MemberModel) {
  $scope.intercessor = intercessor;
  $scope.editedIntercessor = new IntercessorModel($scope.intercessor);
  $scope.close = function () {
    $modalInstance.close({
      'action': 'close',
      'intercessor': $scope.intercessor
    });
  };
  $scope.edit = function () {
    $scope.editing = true;
  };
  $scope.save = function () {
    _.assign($scope.intercessor, $scope.editedIntercessor);
    $scope.editedIntercessor.$update({}, function (){
      $scope.success = true;
    }, function (httpResponse) {
      $scope.error = true;
    });
    $scope.editing = false;
  };
  $scope.confirmDeletion = false;
  $scope.delete = function () {
    $scope.editedIntercessor.$delete();
    $modalInstance.close({
      'action': 'delete',
      'intercessor': $scope.intercessor
    });
  };

  var records = PrayerRecordModel.get({intercessor: $scope.intercessor.id}, function () {
    // limit to 7 recent records
    $scope.records = records.prayerRecords.reverse().slice(0,7);
    _.forEach($scope.records, function (record) {
      // fetch the details for the member
      if (!_.isEmpty(record.links)) {
        //record.links.member = '53968e4df2e779000053f7b6';
        MemberModel.get({id: record.links.member}, function (member) {
          console.log(member.members[0]);
          record.member = member.members[0];
        });
      }
    });
  });

  $scope.deleteRecord = function (id) {
    var recordToDelete = new PrayerRecordModel({id:id});
    recordToDelete.$delete();
    var indexToUpdate = _.findIndex($scope.records, function (i) {
      return i.id === id;
    });
    $scope.records.splice(indexToUpdate, 1);
  };
});
