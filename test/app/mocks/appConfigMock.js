angular.module('appConfig', []).constant('APP_CONFIG',
  {
    "apiEndpoint": "http://192.168.0.103:3000/api/",
    "authenticate" : "http://192.168.0.103:3000/api/authenticate",
    "logout" : "http://192.168.0.103:3000/api/logout"
  });