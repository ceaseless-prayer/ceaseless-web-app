'use strict';

var config = require('../../config')
, kue = require('kue')
, logger = require('../../lib/logger/notifier');

/**
 * This module attaches a handler to the notifier kue
 * to clean up jobs.
 **/

function JobCleaner () {
  this.notificationKue = kue.createQueue(config.get('kue'));
  this.notificationKue.on('job complete', function(id, result){
    kue.Job.get(id, function (err, job) {
      if (err) {
        return;
      }
      job.remove(function(err) {
        if (err) {
          throw err;
        }
        logger.info('removed completed job #%d', job.id);
      });
    });
  });
}

module.exports = JobCleaner;


