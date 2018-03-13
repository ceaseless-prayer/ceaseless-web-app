'use strict';

angular.module('ceaselessLite')
.factory('SubscriberModel', function ($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.apiEndpoint+'subscribers/:id', {id: '@id', email:'@email'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'subscribers' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           delete data.id;
           return angular.toJson({ 'subscribers' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).subscribers[0];
         }
         }
    });
});
