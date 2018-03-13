'use strict';

angular.module('ceaselessLite')
.controller('IntercessorsCtrl', function ($scope, $modal, $http, IntercessorModel) {

  $scope.openAddIntercessorForm = function () {
    var modalInstance = $modal.open({
      templateUrl: 'intercessors/addIntercessorForm.html',
        controller: 'AddIntercessorCtrl',
        windowClass: 'intercessor-form'
    });

    modalInstance.result.then(function (intercessor) {
      var newIntercessor = new IntercessorModel(intercessor);
      newIntercessor.$save(function () {
        _.assign(intercessor, newIntercessor.intercessors[0]);
      });
      $scope.intercessors.push(intercessor);
    }, function () {
    });
  };

  var intercessors = IntercessorModel.query(function () {
    $scope.intercessors = intercessors.intercessors;
  });

  $scope.changeActivation = function (intercessor) {
    var editedIntercessor = new IntercessorModel(intercessor);
    editedIntercessor.active = !editedIntercessor.active;
    editedIntercessor.$update({}, function () {
      intercessor.active = editedIntercessor.active;
    }, function (httpResponse) {

    });
  };

  $scope.clickEffect = function (intercessor) {
    var modalInstance = $modal.open({
      templateUrl: 'intercessors/intercessorDetail.html',
      controller: 'IntercessorDetailCtrl',
      resolve: {
        intercessor: function () {
                return intercessor;
              }
      },
      windowClass: 'intercessor-form'
    });

    modalInstance.result.then(function (action) {
      var indexToUpdate = _.findIndex($scope.intercessors, function (i) {
        return i.id === action.intercessor.id;
      });
      switch (action.action) {
        case 'delete':
          $scope.intercessors.splice(indexToUpdate, 1);
          break;
        case 'close':
          $scope.intercessors[indexToUpdate] = action.intercessor;
          break;
      }

    }, function () {
    });
  };
});

