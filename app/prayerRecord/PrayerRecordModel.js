'use strict';

angular.module('ceaselessLite')
.factory('PrayerRecordModel', function ($resource, APP_CONFIG) {
  return $resource(APP_CONFIG.apiEndpoint+'prayerRecords/:id', {id: '@id', intercessor: '@intercessor'},
    { 'query': { method: 'GET', isArray: false },
      'save': { method: 'POST', transformRequest: function (data, headersGetter) {
        return angular.toJson({ 'prayerRecords' : [data] });
      }
      },
         'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
           delete data.id;
           return angular.toJson({ 'prayerRecords' : [data] });
         }, transformResponse: function (data, headersGetter) {
           return angular.fromJson(data).prayerRecords[0];
         }
         }
    });
});
