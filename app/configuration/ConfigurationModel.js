'use strict';

angular.module('ceaselessLite.config')
  .factory('ConfigurationModel', function ($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.apiEndpoint+'configurations/:id', {id: '@id'},
      { 'query': { method: 'GET', isArray: false },
        'save': { method: 'POST', transformRequest: function (data, headersGetter) {
          return angular.toJson({ 'configurations' : [data] });
        }
        },
        'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
          return angular.toJson({ 'configurations' : [data] });
        }, transformResponse: function (data, headersGetter) {
          return angular.fromJson(data).configurations[0];
        }
        }
      });
  });
