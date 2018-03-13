'use strict';

angular.module('ceaselessLite.config')
  .controller('ConfigurationCtrl', function ($scope, $http, ConfigurationModel) {
    $scope.defaultConfigurations = _.map([
      'activated',
      'mail server',
      'mail port',
      'mail username',
      'mail password',
      'time to send'
    ], function (c) {
      return _.zipObject(['key', 'value'], [c, 'dummy']);
    });

    var configurations = ConfigurationModel.query(function () {
      var loadedKeys = _.pluck(configurations.configurations, 'key');
      var configMap = _.zipObject(loadedKeys, configurations.configurations);
      $scope.configurations = _.map($scope.defaultConfigurations, function (c) {
        if (_.contains(loadedKeys, c.key)) {
          c = configMap[c.key]; // replace with the config service's info.
          return c;
        } else {
          return c;
        }
      });
    });
  })
  .controller('RowCtrl', function ($scope, $http, ConfigurationModel, UserService) {
    $scope.clickEffect = function () {
      $scope.original = $scope.configuration.value;
      $scope.editing = true;
    };

    $scope.cancel = function () {
      $scope.configuration.value = $scope.original;
      $scope.editing = false;
    };

    $scope.clear = function () {
      $scope.configuration.value = '';
      $scope.editing = false;
      var configModel = new ConfigurationModel($scope.configuration);
      configModel.$delete();
    };

    $scope.save = function () {
      $scope.original = $scope.configuration.value;
      var configModel = new ConfigurationModel($scope.configuration);
      configModel.links = {
        owner: UserService.auth.userId
      };

      if (angular.isUndefined($scope.configuration.id)) {
        configModel.$save(function (config) {
          $scope.configuration.id = config.configurations[0].id;
        });
      } else {
        configModel.$update();
      }
      $scope.editing = false;
    };
  });