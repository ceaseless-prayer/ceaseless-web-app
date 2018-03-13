'use strict';

var _ = require('lodash')
, fs = require('fs')
, request = require('request')
, config = require('../../../config')
, logger = require('../../logger/webserver')
, imageWebPath = config.get('endpoints:webEndpoint')
, dbpApiKey = config.get('scripture:dbpApiKey');

var votd = [
  { book: '1Chr', chapter: '16', verse_start: '11', verse_end: '11' } ,
  { book: '1Chr', chapter: '29', verse_start: '9', verse_end: '20' } ,
  { book: '1Cor', chapter: '14', verse_start: '15', verse_end: '15' } ,
  { book: '1John', chapter: '5', verse_start: '14', verse_end: '15' } ,
  { book: '1John', chapter: '3', verse_start: '19', verse_end: '24' } ,
  { book: '1Kgs', chapter: '17', verse_start: '20', verse_end: '22' } ,
  { book: '1Kgs', chapter: '18', verse_start: '36', verse_end: '39' } ,
  { book: '1Kgs', chapter: '3', verse_start: '6', verse_end: '9' } ,
  { book: '1Kgs', chapter: '8', verse_start: '23', verse_end: '61' } ,
  { book: '1Pet', chapter: '3', verse_start: '7', verse_end: '7' } ,
  { book: '1Pet', chapter: '4', verse_start: '7', verse_end: '7' } ,
  { book: '1Sam', chapter: '1', verse_start: '10', verse_end: '12' } ,
  { book: '1Thess', chapter: '5', verse_start: '16', verse_end: '18' } ,
  { book: '1Thess', chapter: '5', verse_start: '23', verse_end: '25' } ,
  { book: '1Tim', chapter: '2', verse_start: '1', verse_end: '4' } ,
  { book: '1Tim', chapter: '2', verse_start: '8', verse_end: '8' } ,
  { book: '2Chr', chapter: '20', verse_start: '1', verse_end: '37' } ,
  { book: '2Chr', chapter: '7', verse_start: '14', verse_end: '14' } ,
  { book: '2Cor', chapter: '13', verse_start: '7', verse_end: '7' } ,
  { book: '2Kgs', chapter: '19', verse_start: '15', verse_end: '19' } ,
  { book: '2Kgs', chapter: '20', verse_start: '1', verse_end: '7' } ,
  { book: '2Kgs', chapter: '6', verse_start: '15', verse_end: '18' }  ,
  { book: '2Thess', chapter: '1', verse_start: '11', verse_end: '12' } ,
  { book: 'Acts', chapter: '1', verse_start: '24', verse_end: '25' } ,
  { book: 'Acts', chapter: '10', verse_start: '30', verse_end: '31' } ,
  { book: 'Acts', chapter: '13', verse_start: '1', verse_end: '3' } ,
  { book: 'Acts', chapter: '4', verse_start: '24', verse_end: '31' } ,
  { book: 'Acts', chapter: '6', verse_start: '4', verse_end: '4' } ,
  { book: 'Acts', chapter: '7', verse_start: '60', verse_end: '60' } ,
  { book: 'Acts', chapter: '9', verse_start: '6', verse_end: '6' } ,
  { book: 'Col', chapter: '1', verse_start: '9', verse_end: '17' } ,
  { book: 'Dan', chapter: '9', verse_start: '1', verse_end: '19' } ,
  { book: 'Deut', chapter: '3', verse_start: '24', verse_end: '29' } ,
  { book: 'Deut', chapter: '9', verse_start: '26', verse_end: '29' } ,
  { book: 'Eph', chapter: '1', verse_start: '15', verse_end: '23' } ,
  { book: 'Eph', chapter: '3', verse_start: '14', verse_end: '21' } ,
  { book: 'Eph', chapter: '6', verse_start: '11', verse_end: '18' } ,
  { book: 'Eph', chapter: '6', verse_start: '18', verse_end: '18' } ,
  { book: 'Eph', chapter: '6', verse_start: '18', verse_end: '19' } ,
  { book: 'Exod', chapter: '33', verse_start: '12', verse_end: '18' } ,
  { book: 'Ezra', chapter: '8', verse_start: '21', verse_end: '23' } ,
  { book: 'Heb', chapter: '13', verse_start: '15', verse_end: '15' } ,
  { book: 'Heb', chapter: '4', verse_start: '15', verse_end: '16' } ,
  { book: 'Heb', chapter: '7', verse_start: '25', verse_end: '25' } ,
  { book: 'Heb', chapter: '5', verse_start: '7', verse_end: '10' } ,
  { book: 'Hos', chapter: '10', verse_start: '12', verse_end: '12' } ,
  { book: 'Isa', chapter: '55', verse_start: '6', verse_end: '6' } ,
  { book: 'Jas', chapter: '1', verse_start: '5', verse_end: '8' } ,
  { book: 'Jas', chapter: '4', verse_start: '3', verse_end: '3' } ,
  { book: 'Jas', chapter: '5', verse_start: '13', verse_end: '16' } ,
  { book: 'Jas', chapter: '5', verse_start: '16', verse_end: '18' },
  { book: 'Jer', chapter: '29', verse_start: '7', verse_end: '7' } ,
  { book: 'Jer', chapter: '29', verse_start: '11', verse_end: '13' } ,
  { book: 'Jer', chapter: '32', verse_start: '17', verse_end: '19' } ,
  { book: 'John', chapter: '11', verse_start: '41', verse_end: '42' } ,
  { book: 'John', chapter: '12', verse_start: '27', verse_end: '28' } ,
  { book: 'John', chapter: '14', verse_start: '13', verse_end: '14' } ,
  { book: 'John', chapter: '17', verse_start: '1', verse_end: '26' } ,
  { book: 'Jonah', chapter: '2', verse_start: '2', verse_end: '9' } ,
  { book: 'Judg', chapter: '16', verse_start: '28', verse_end: '28' } ,
  { book: 'Lam', chapter: '3', verse_start: '21', verse_end: '26' } ,
  { book: 'Luke', chapter: '11', verse_start: '1', verse_end: '13' } ,
  { book: 'Luke', chapter: '18', verse_start: '1', verse_end: '8' } ,
  { book: 'Luke', chapter: '18', verse_start: '9', verse_end: '14' } ,
  { book: 'Luke', chapter: '22', verse_start: '31', verse_end: '32' } ,
  { book: 'Luke', chapter: '22', verse_start: '39', verse_end: '46' } ,
  { book: 'Luke', chapter: '23', verse_start: '34', verse_end: '34' } ,
  { book: 'Luke', chapter: '23', verse_start: '46', verse_end: '46' } ,
  { book: 'Luke', chapter: '6', verse_start: '12', verse_end: '12' } ,
  { book: 'Mark', chapter: '11', verse_start: '17', verse_end: '17' } ,
  { book: 'Mark', chapter: '11', verse_start: '22', verse_end: '25' } ,
  { book: 'Mark', chapter: '9', verse_start: '28', verse_end: '29' } ,
  { book: 'Matt', chapter: '11', verse_start: '25', verse_end: '26' } ,
  { book: 'Matt', chapter: '18', verse_start: '19', verse_end: '20' } ,
  { book: 'Matt', chapter: '21', verse_start: '22', verse_end: '22' } ,
  { book: 'Matt', chapter: '26', verse_start: '39', verse_end: '42' } ,
  { book: 'Matt', chapter: '4', verse_start: '1', verse_end: '1' } ,
  { book: 'Matt', chapter: '5', verse_start: '43', verse_end: '44' } ,
  { book: 'Matt', chapter: '6', verse_start: '5', verse_end: '12' } ,
  { book: 'Matt', chapter: '6', verse_start: '5', verse_end: '15' } ,
  { book: 'Matt', chapter: '6', verse_start: '6', verse_end: '13' } ,
  { book: 'Matt', chapter: '7', verse_start: '11', verse_end: '11' } ,
  { book: 'Matt', chapter: '7', verse_start: '7', verse_end: '8' } ,
  { book: 'Neh', chapter: '1', verse_start: '5', verse_end: '6' } ,
  { book: 'Neh', chapter: '9', verse_start: '1', verse_end: '1' } ,
  { book: 'Num', chapter: '12', verse_start: '13', verse_end: '13' } ,
  { book: 'Phil', chapter: '1', verse_start: '9', verse_end: '11' } ,
  { book: 'Phil', chapter: '4', verse_start: '6', verse_end: '7' } ,
  { book: 'Phlm', chapter: '1', verse_start: '4', verse_end: '7' } ,
  { book: 'Prov', chapter: '15', verse_start: '29', verse_end: '29' } ,
  { book: 'Prov', chapter: '15', verse_start: '8', verse_end: '8' } ,
  { book: 'Ps', chapter: '108', verse_start: '12', verse_end: '13' } ,
  { book: 'Ps', chapter: '116', verse_start: '12', verse_end: '14' } ,
  { book: 'Ps', chapter: '118', verse_start: '25', verse_end: '25' } ,
  { book: 'Ps', chapter: '118', verse_start: '28', verse_end: '29' } ,
  { book: 'Ps', chapter: '13', verse_start: '1', verse_end: '6' } ,
  { book: 'Ps', chapter: '139', verse_start: '1', verse_end: '24' } ,
  { book: 'Ps', chapter: '141', verse_start: '1', verse_end: '2' } ,
  { book: 'Ps', chapter: '145', verse_start: '18', verse_end: '18' } ,
  { book: 'Ps', chapter: '17', verse_start: '1', verse_end: '1' } ,
  { book: 'Ps', chapter: '23', verse_start: '1', verse_end: '6' } ,
  { book: 'Ps', chapter: '25', verse_start: '1', verse_end: '1' } ,
  { book: 'Ps', chapter: '25', verse_start: '1', verse_end: '22' } ,
  { book: 'Ps', chapter: '27', verse_start: '14', verse_end: '14' } ,
  { book: 'Ps', chapter: '3', verse_start: '1', verse_end: '8' } ,
  { book: 'Ps', chapter: '35', verse_start: '1', verse_end: '28' } ,
  { book: 'Ps', chapter: '4', verse_start: '1', verse_end: '1' } ,
  { book: 'Ps', chapter: '4', verse_start: '1', verse_end: '8' } ,
  { book: 'Ps', chapter: '5', verse_start: '1', verse_end: '12' } ,
  { book: 'Ps', chapter: '5', verse_start: '3', verse_end: '3' } ,
  { book: 'Ps', chapter: '50', verse_start: '7', verse_end: '15' } ,
  { book: 'Ps', chapter: '51', verse_start: '1', verse_end: '19' } ,
  { book: 'Ps', chapter: '55', verse_start: '17', verse_end: '17' } ,
  { book: 'Ps', chapter: '56', verse_start: '8', verse_end: '11' } ,
  { book: 'Ps', chapter: '6', verse_start: '1', verse_end: '10' } ,
  { book: 'Ps', chapter: '65', verse_start: '1', verse_end: '2' } ,
  { book: 'Ps', chapter: '66', verse_start: '18', verse_end: '19' } ,
  { book: 'Ps', chapter: '7', verse_start: '1', verse_end: '17' } ,
  { book: 'Ps', chapter: '86', verse_start: '12', verse_end: '13' } ,
  { book: 'Ps', chapter: '90', verse_start: '17', verse_end: '17' } ,
  { book: 'Ps', chapter: '102', verse_start: '16', verse_end: '17' } ,
  { book: 'Ps', chapter: '103', verse_start: '1', verse_end: '5' } ,
  { book: 'Rev', chapter: '5', verse_start: '8', verse_end: '8' } ,
  { book: 'Rev', chapter: '8', verse_start: '3', verse_end: '4' } ,
  { book: 'Rom', chapter: '12', verse_start: '12', verse_end: '12' } ,
  { book: 'Rom', chapter: '15', verse_start: '13', verse_end: '13' } ,
  { book: 'Rom', chapter: '8', verse_start: '26', verse_end: '26' } ,
  { book: 'Rom', chapter: '8', verse_start: '34', verse_end: '34' }
];

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

var scriptureImages = fs.readdirSync('app/scripture/images');

var languageVolumeMap = {
  'zh_CN': {
    code: 'UN1',
    nt: 'CHNUN1N2ET',
    ot: 'CHNUN1O2ET',
    bible: 'CHNUN1'
  },
  'in_ID': {
    code: 'NTV',
    nt: 'INZNTVN2ET',
    ot: 'INZNTVO2ET',
    bible: 'INZNTV'
  },
  'hi_IN': {
    code: 'WTC',
    nt: 'HNDWTC',
    ot: 'HNDWTC',
    bible: 'HNDWTC'
  },
  'ko_KR': {
    code: 'SKV',
    nt: 'KO1SKVN2ET',
    ot: 'KO1SKVO2ET',
    bible: 'KO1SKV'
  },
  'es': {
    code: 'BDA',
    nt: 'SPNBDAN2ET',
    ot: 'SPNBDAO2ET',
    bible: 'SPNBDA'
  },
  'jp': {
    code: 'CJV',
    nt: 'JPNCJVN2ET',
    ot: 'JPNCJVO2ET',
    bible: 'JPNCJV'
  },
  'default': {
    code: 'ESV',
    nt: 'ENGESVN2ET',
    ot: 'ENGESVO2ET',
    bible: 'ENGESV'
  }
};

var getVolume = function (book, language) {
  var details = languageVolumeMap[language] || languageVolumeMap['default'];
  return ntBooks.indexOf(book) > -1 ? details.nt : details.ot;
};

var getVolumeCode = function (language) {
  var details = languageVolumeMap[language] || languageVolumeMap['default'];
  return details.code;
};

var formatScripture = function (verses, language) {
  if (_.isEmpty(verses)) {
    logger.error('Failed to get verses.');
    return {
      text: 'Pray without ceasing.',
      citation: '1 Thessalonians 5:17',
      bible: 'ENGESV'
    };
  } else {
    var citation = verses[0].book_name + ' ' + verses[0].chapter_id + ':' + verses[0].verse_id;

    if (_.size(verses) > 1) {
      citation += '-' + _.last(verses).verse_id;
    }
    citation += ' ' + getVolumeCode(language);

    var details = languageVolumeMap[language] || languageVolumeMap['default'];
    return {
      text: _.pluck(verses, 'verse_text')
        .map(function (v) { return v.trim(); }).join(' '),
      citation: citation,
      bible: details.bible || 'ENGESV'
    };
  }
};

var middleware = {
  verseOfTheDay : function (req, res, next) {
    if (!req.path.match(/votd/i)) {
      return next();
    }
    var reference = '';

    if (req.query.language == 'hi_IN') {
      reference = '';
      do {
        reference = votd[_.random(votd.length-1)];
      } while (ntBooks.indexOf(reference.book) <= -1);
      res.send(reference);
    }

    reference = votd[_.random(votd.length-1)];
    res.send(reference);
  },
  getScripture : function (req, res, next) {
    if (!req.path.match(/getScripture/i)) {
      return next();
    }

    // if empty body, just pick a random verse
    var reference = req.body;
    if (_.isEmpty(req.body)) {
      reference = votd[_.random(votd.length-1)];
    }
    var language = reference.language || 'en';
    var dam_id = getVolume(reference.book, language);

    var dbtUrl = 'http://dbt.io/text/verse?v=2&key=' +
      dbpApiKey +
      '&book_id=' + reference.book + '&chapter_id=' + reference.chapter +
      '&verse_start=' + reference.verse_start + '&verse_end=' + reference.verse_end +
      '&dam_id=' + dam_id;

    logger.info('Requesting ', reference);

    request.get({url:dbtUrl, json: true}, function (e, r, verses) {
      if (e) {
        res.send(r.statusCode, e);
      } else {
        res.send(formatScripture(verses, language));
      }
    });
  },
  getAScriptureImage : function (req, res, next) {
    if (!req.path.match(/getAScriptureImage/i)) {
      return next();
    }

    var imageHostPath = imageWebPath + 'scripture/images/';
    var selectedImageUrl = imageHostPath+scriptureImages[_.random(scriptureImages.length-1)];

    res.send({
      imageUrl: selectedImageUrl
    });
  }
};

module.exports = middleware;
