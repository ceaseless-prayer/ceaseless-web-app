'use strict';

angular.module('ceaselessLite.scripture', ['pascalprecht.translate'])
  .factory('ScriptureFactory', function ($http, $translate, APP_CONFIG) {

    var ntBooks = [
      'Matt',
      'Mark',
      'Luke',
      'John',
      'Acts',
      'Rom',
      '1Cor',
      '2Cor',
      'Gal',
      'Eph',
      'Phil',
      'Col',
      '1Thess',
      '2Thess',
      '1Tim',
      '2Tim',
      'Titus',
      'Phlm',
      'Heb',
      'Jas',
      '1Pet',
      '2Pet',
      '1John',
      '2John',
      '3John',
      'Jude',
      'Rev'];

    var getVolume = function (book) {
      return ntBooks.indexOf(book) > -1 ? $translate('NT_DAM_ID') : $translate('OT_DAM_ID');
    };

    var chooseVerse = function(callback) {
      $http.get(APP_CONFIG.apiEndpoint+'votd').success(function (data) {
        getVolume(data.book).then(function (dam_id) {
          getScripture(callback, dam_id, data.book, data.chapter, data.verse_start, data.verse_end);
        });
      });
    };

    var getScripture = function (callback, dam_id, book, chapter, verseStart, verseEnd) {
      var dbtUrl = 'http://dbt.io/text/verse?v=2&key=' +
        APP_CONFIG.dbtApiKey +
        '&book_id=' + book + '&chapter_id=' + chapter +
        '&verse_start=' + verseStart + '&verse_end=' + verseEnd +
        '&dam_id=' + dam_id;
      $http.get(dbtUrl).success(function (verses) {
        var citation = '(' + verses[0].book_name + ' ' + verses[0].chapter_id + ':' + verses[0].verse_id;
        if (_.size(verses) > 1) {
          citation += '-' + _.last(verses).verse_id;
        }
        citation += ')';
        console.log(verses);
        callback(_.pluck(verses, 'verse_text').join(' '), citation);
      }).error(function (error) {
        console.log('Failed to fetch verses');
      });
    };

    return {
      getScripture: getScripture,
      chooseVerse: chooseVerse,
      getVolume: getVolume
    };
  });
