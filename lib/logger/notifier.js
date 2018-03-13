'use strict';

var winston = require('winston')
 , config = require('../../config');

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: config.get('logger:notifier:filename'),
      maxsize: 1048576,
      maxFiles: 3,
      level: config.get('logger:notifier:level')
    })
  ]
});
