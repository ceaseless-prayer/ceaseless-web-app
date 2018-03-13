'use strict';

angular.module('ceaselessLite')
.factory('MessageModel', function ($resource, APP_CONFIG) {
  return $resource(APP_CONFIG.apiEndpoint+'messages/:id', {id: '@id', user: '@user'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'messages' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           delete data.id;
           return angular.toJson({ 'messages' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).messages[0];
         }
         }
    });
});
