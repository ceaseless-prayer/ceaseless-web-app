'use strict';

angular.module('ceaselessLite')
  .factory('PrayerUpdateModel', function ($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.apiEndpoint+'prayerUpdates/:id', {id: '@id', author: '@intercessor'},
      { 'query': { method: 'GET', isArray: false },
        'save': { method: 'POST', transformRequest: function (data, headersGetter) {
          return angular.toJson({ 'prayerUpdates' : [data] });
        }
        },
        'update': { method: 'PUT', transformRequest: function (data, headersGetter) {
          delete data.id;
          return angular.toJson({ 'prayerUpdates' : [data] });
        }, transformResponse: function (data, headersGetter) {
          return angular.fromJson(data).prayerUpdates[0];
        }
        }
      });
  });
