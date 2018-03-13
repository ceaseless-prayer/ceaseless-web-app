'use strict';

var config = require('../../config')
, schedule = require('node-schedule')
, kue = require('kue')
, _ = require('lodash')
, RSVP = require('rsvp')
, request = require('request')
, endpoint = config.get('endpoints:apiEndpoint')
, app = require('../../lib/resources/prayer').app
, configurationResource = require('../../lib/resources/configuration').app
, logger = require('../../lib/logger/notifier');

/**
* This module schedules a job which goes through the list of
* intercessors and members and decides whether or not to notify
* an intercessor and ask them to pray.
*
* Notification tasks are put onto a queue and handled by another
* module to figure out the best transport for notification and to
* send it out.
**/

function NotificationProducer() {
  this.taskName = config.get('notifier:taskName');
  this.frequency = config.get('notifier:frequency');
  this.membersPerDay = config.get('notifier:membersPerDay');
  this.notificationTime = config.get('notifier:timeOfDay');
  this.notificationKue = kue.createQueue(config.get('kue'));
  this.job = null;
}

NotificationProducer.prototype = {
  start: function () {
    // TODO deal with error handling on a long running process
    // what happens if this dies?

    var self = this;
    var rule = new schedule.RecurrenceRule();
    rule.minute = 0;
    this.job = schedule.scheduleJob(rule, function () {
      logger.info('Preparing to send notifications.');
      if(self.itIsTimeToSendNotification()) {
        app.adapter.findMany('user')
          .then(_.bind(self.getActiveUsers, self))
          .then(function (activeUsers) {
            _.forEach(activeUsers, function (u) {
              RSVP.hash({
                scripture: self.getScripture(),
                intercessors: self.getIntercessors(u)
              }).then(function (round) {
                _.forEach(round.intercessors, function (i) {
                  self.getMembersToPrayFor(u).then(function (members) {
                    self.createTaskForIntercessor(i, members, round.scripture);
                  });
                });
              });
            });
          })
          .catch(function (error) {
            logger.error('Failed to produce notifications', error);
          });
      }
    });

    logger.info('NotificationProducer started');
  },
  getActiveUsers: function (users) {
    var waitingFor = (users || [])
      .map(this.userInstallationIsActive);
    return RSVP.all(waitingFor)
      .then(function (active) {
        var activeUsers = _.zip(active, users).filter(function (i) { return i[0]; } );
        return _.pluck(activeUsers, 1);
      });
  },
  getIntercessors: function (user) {
    return new RSVP.Promise(function (resolve, reject) {
      var result = app.adapter.findMany('intercessor', { owner: user.id, active: true });
      result.then(
          function (intercessors) {
            resolve(intercessors);
          },
          function (error) {
            logger.error('Failed to get intercessors', error);
            resolve([]);
          }
      );
    });
  },
  getScripture: function () {
    return new RSVP.Promise(function (resolve, reject) {
      request({url: endpoint + 'votd', json:true})
        .pipe(request.get({url: endpoint + 'getScripture', json: true}, function (e, r, scripture) {
          if (e || r.statusCode !== 200) {
            logger.error('Failed to fetch Scripture', scripture);
            reject(e);
          } else {
            resolve(scripture);
          }
      }));
    });
  },
  createTaskForIntercessor: function (intercessor, members, scripture) {

    // Poll for people who need to be notified of people to pray for
    var context = {
      title: 'Suggested friends to pray for',
      scripture: scripture,
      members: members
    };

    // Schedule a job to mail the user.
    var task = {
      title: this.taskName + ' (' + intercessor.email + ')',
      transport: 'email',
      context: context,
      recipient: intercessor,
      template: 'templates/simple_email.html'
    };

    this.notificationKue.create(this.taskName, task)
      .priority('high').attempts(5).save();
  },
  getMembersToPrayFor: function (user) {
    // TODO make this configurable
    // TODO limit this to people in the same group (by owner)
    var limit = this.membersPerDay;
    return new RSVP.Promise(function (resolve) {
      app.adapter.findMany('member', { owner: user.id }).then(
          function (members) {
            // set undefined prayedFor as 0.
            _.forEach(members, function (member) {
              if (_.isUndefined(member.prayedFor)) {
                member.prayedFor = 0;
              }
            });

            // get least prayed for members
            members = _.sortBy(members, 'prayedFor').slice(0, limit);
            resolve(members);
          },
          function (error) {
            logger.error('Failed to get members to pray for', error);
            resolve([]);
          }
      );
    });
  },
  itIsTimeToSendNotification: function () {
    // TODO make this configurable on a per use level
    // TODO take into account time zone
    var currentHour = new Date().getHours();
    return currentHour === this.notificationTime;
  },
  userInstallationIsActive: function (user) {
    return new RSVP.Promise(function (resolve) {
      configurationResource.adapter.find('configuration', {owner: user.id, key: 'activated'}).then(
          function (config) {
            resolve(config.value);
          },
          function (error) {
            logger.info('Could not detect if user installation is active', error);
            resolve(false);
          }
      );
    });
  }
};

module.exports = NotificationProducer;


