'use strict';

var _ = require('lodash')
    , logger = require('../../logger/webserver');

var middleware = function (app, metricResourceName) {
  return {
    openHistory: function (req, res, next) {
      if (!req.path.match(/metrics\/email/i)) {
        return next();
      }

      var subject = req.body.subject; // TODO parse url?
      if (!_.isEmpty(subject)) {
        app.adapter.findMany(metricResourceName, {subject: subject})
            .then(function (metrics) {
              res.send(200, metrics);
            }, function (error) {
              logger.info('Failed to fetch metric', error);
              res.send(500);
            });
      }
    }
  };
};

module.exports = middleware;
