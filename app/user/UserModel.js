'use strict';

angular.module('ceaselessLite')
.factory('UserModel', function ($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.apiEndpoint+'users/:id', {id: '@id'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'users' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           return angular.toJson({ 'users' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).users[0];
         }
         }
    });
});
