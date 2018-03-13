'use strict';

angular.module('ceaselessLite.i18n')
.controller('LanguageListCtrl', function ($translate, $scope) {

  $scope.languages = [
    {
      id: 'en',
      displayName: 'English'
    },
    {
      id: 'id',
      displayName: 'Bahasa Indonesia'
    },
    {
      id: 'cmn-traditional',
      displayName: '正體字'
    }
  ];
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
  };
});
