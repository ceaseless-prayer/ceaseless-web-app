'use strict';

var config = require('../../config')
, kue = require('kue')
, RSVP = require('rsvp')
, _ = require('lodash')
, app = require('../../lib/resources/prayer').app
, template = require('./transports/email/templater')('worker/notifier/transports/email/templates/summer_email.html', [])
, logger = require('../../lib/logger/notifier')
, email = require('./transports/email');

/**
 * This module consumes notification tasks off of a queue created by the NotificationProducer module.
 * It figures out the best transport (e.g. sms, email, app) and sends it out.
 * TODO right now it is limited to e-mail and it simply polls the database on the same interval
 * As the worker which puts jobs on the database.
 */
function NotificationSender() {
  this.taskName = config.get('notifier:taskName');
  this.notificationKue = kue.createQueue(config.get('kue'));
}

NotificationSender.prototype = {
  start: function () {
    // process 20 email tasks
    this.notificationKue.process(this.taskName, 20, _.bind(this.performTask, this));
    logger.info('NotificationSender started and listening to queue');
  },
  performTask: function (job, jobDone) {
    var self = this;
    var response = this.createAndSendMessage(job.data);
    return new RSVP.Promise(function (resolve, reject) {
      response.then(function () {
        var curriedCreatePrayerRecord = _.curry(self.createPrayerRecord, 2)(job.data.recipient);
        var updateCountAndCreateRecord = _.compose(self.updatePrayerCount, curriedCreatePrayerRecord);
        var result = _.map(job.data.context.members, updateCountAndCreateRecord, self);
        RSVP.all(result)
          .then(function () { jobDone(); resolve(); })
          .catch(function (err) { jobDone(err); reject(err); });
      }, function (err) {
        jobDone(err);
        reject(err);
      });
    });
  },
  createAndSendMessage: function (task) {
    var subject = 'Pray for ';
    // deal with no members passed in by asking them to pray for anyone.
    var firstMember = task.context.members[0] || {'firstName': 'Anyone', 'lastName': ''};
    subject += firstMember.firstName + ' ' + firstMember.lastName;
    if (task.context.members.length > 1) {
      subject += ' and others';
    }

    // prep members into rows for e-mail template.
    task.context.memberRows = template.convertArrayIntoRows(task.context.members, 2);
    var message = template.render(task.context);

    return email.sendMail(task.recipient.email, subject, message);
  },
  createPrayerRecord: function (intercessor, member) {
    var prayerRecord = {
      createDate: new Date(),
      links: {
        intercessor: intercessor.id,
        member: member.id
      }
    };
    app.adapter.create('prayerRecord', prayerRecord).then(
      function () {
        logger.info('Created prayer record for intercessor', intercessor.id, 'and member', member.id);
      },
      function (err) {
        logger.error('Failed to create prayer record for intercessor', intercessor.id, 'and member', member.id, err);
      }
    );
    return member;
  },
  updatePrayerCount: function (member) {
    // update number of times suggested to prayed for by 1
    // TODO this breaks an abstraction layer unfortunately.
    // We want to use $inc instead of update to make it atomic
    // hopefully this will be added to the fortune adapter soon
    // https://github.com/daliwali/fortune/blob/master/lib/adapters/nedb.js
    if (_.isUndefined(app.adapter.increment)) {
      app.adapter.increment = _.bind(function (model, id, field, step) {
        var _this = this;
        var update = { $inc: {} };
        update.$inc[field] = step;
        model = typeof model === 'string' ? this.model(model) : model;
        return new RSVP.Promise(function (resolve, reject) {
          var find = {_id: id};
          model.update(find, update, function (error) {
            if (error) {
              return reject(error);
            }

            model.findOne(find, function (error, resource) {
              _this._handleWrite(model, resource, error, resolve, reject);
            });
          });
        });
      }, app.adapter);
    }

    app.adapter.increment('member', member.id, 'prayedFor', 1).then(
      function () {
        logger.info('Updated prayed for count for', member.id);
      },
      function (err) {
        logger.error('Failed to update prayer count for', member.id, err);
      }
    );
    return member;
  },
  shutdown: function () {
    email.close(function () {
      logger.info('Closing the emailer.');
    });
  }
};

module.exports = NotificationSender;


