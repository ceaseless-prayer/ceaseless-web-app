'use strict';

var config = require('../../config')
, schedule = require('node-schedule')
, RSVP = require('rsvp')
, _ = require('lodash')
, app = require('../../lib/resources/auth').app
, logger = require('../../lib/logger/token_cleaner');

/**
 * This module cleans up tokens when they have passed their expiration date.
 */
function TokenCleaner() {
  this.taskName = config.get('notifier:taskName');
}

TokenCleaner.prototype = {
  start: function () {
    var self = this;
    // this rule means run every hour.
    var rule = new schedule.RecurrenceRule();
    rule.minute = 0;
    self.job = schedule.scheduleJob(rule, function () {
      self.cleanExpiredTokens().then(function () {
        logger.info("Finished cleaning expired tokens");
      }, function (error) {
        logger.error("Failed to clean up tokens", error);
      });
    });
    logger.info('TokenCleaner started');
  },
  cleanExpiredTokens: function () {
    return new RSVP.Promise(function (resolve, reject) {
      app.adapter.findMany('token', {}).then(function (tokens) {
        var now = new Date();
        var cleanedTokens = tokens.map(function (token) {
          if (token.expiration === null || token.expiration < now) {
            app.adapter.delete('token', token.id);
          }
        });
        resolve(RSVP.all(cleanedTokens));
      }, function (error) {
        logger.error('Failed to get tokens', error);
        resolve([]);
      });
    });
  },
  shutdown: function () {
    logger.info('Closing token cleaner');
  }
};

module.exports = TokenCleaner;


