'use strict';

angular.module('ceaselessLite')
.factory('NoteModel', function ($resource, APP_CONFIG) {
  return $resource(APP_CONFIG.apiEndpoint+'notes/:id', {id: '@id', member: '@member'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'notes' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           delete data.id;
           return angular.toJson({ 'notes' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).notes[0];
         }
         }
    });
});
