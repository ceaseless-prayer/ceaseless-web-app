'use strict';

angular.module('ceaselessLite')
.factory('IntercessorModel', function ($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.apiEndpoint+'intercessors/:id', {id: '@id'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'intercessors' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           delete data.id;
           return angular.toJson({ 'intercessors' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).intercessors[0];
         }
         }
    });
});
