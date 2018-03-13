'use strict';

var config = require('../../config')
, kue = require('kue')
, _ = require('lodash')
, logger = require('../../lib/logger/notifier')
, email = require('./transports/email');

/**
 * This module consumes prayer digest update notification tasks off of a queue
 * created by the PrayerUpdateDigestProducer module.
 * It figures out the best transport (e.g. sms, email, app) and sends it out.
 * TODO right now it is limited to e-mail
 */
function PrayerUpdateDigestSender() {
  this.taskName = config.get('digestProducer:taskName');
  this.notificationKue = kue.createQueue(config.get('kue'));
  this.endpoint = config.get('endpoints:apiEndpoint');
  this.webpath = config.get('endpoints:webEndpoint');
}

PrayerUpdateDigestSender.prototype = {
  start: function () {
    // process 20 email tasks
    this.notificationKue.process(this.taskName, 20, _.bind(this.performTask, this));
    logger.info('PrayerUpdateDigestSender started and listening to queue');
  },

  performTask: function (job, jobDone) {
    // Create the recipient, subject and content based on the job.
    var recipient = job.data.recipient;
    var template = require('./transports/email/templater')('worker/notifier/transports/email/templates/' + job.data.template, []);
    var subject = job.data.context.title;
    var updatesByAuthor = job.data.context.updates;
    var authorIds = _.pluck(_.pluck(job.data.context.updates, 'author'), 'id').join(',');

    // enriching with additional data needed for template
    job.data.context.jobId = job.id;
    job.data.context.basePath = this.endpoint;
    job.data.context.webPath = this.webpath;
    job.data.context.authorIds = authorIds;
    job.data.context.recipient = recipient;

    if (_.isEmpty(updatesByAuthor)) {
      jobDone(); // don't do anything if there are no updates by mistake
    } else {
      var message = template.render(job.data.context);
      email.sendMail(recipient, subject, message);
      jobDone();
    }
  },

  shutdown: function () {
    email.close(function () {
      logger.info('Closing the PrayerUpdateDigestSender emailer.');
    });
  }
};

module.exports = PrayerUpdateDigestSender;


