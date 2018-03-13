'use strict';

angular.module('ceaselessLite')
.factory('MemberModel', function ($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.apiEndpoint+'members/:id', {id: '@id'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'members' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           delete data.id;
           return angular.toJson({ 'members' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).members[0];
         }
         }
    });
});
