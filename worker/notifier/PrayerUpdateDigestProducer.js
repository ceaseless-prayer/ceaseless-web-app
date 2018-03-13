'use strict';

var config = require('../../config')
, schedule = require('node-schedule')
, kue = require('kue')
, _ = require('lodash')
, RSVP = require('rsvp')
, app = require('../../lib/resources/prayer').app
, rn = config.get('auth:resourceNames')
, logger = require('../../lib/logger/notifier');

/**
* This module schedules a job which goes through the list of
* prayer updates and prepares a task to notify subscribers about
* the updates.
*
* Notification tasks are put onto a queue and handled by another
* module to figure out the best transport for notification and to
* send it out.
**/

function PrayerUpdateDigestProducer() {
  this.taskName = config.get('digestProducer:taskName');
  this.template = config.get('digestProducer:template');
  this.frequency = config.get('notifier:frequency');
  this.membersPerDay = config.get('notifier:membersPerDay');
  this.notificationKue = kue.createQueue(config.get('kue'));
  this.job = null;
}

PrayerUpdateDigestProducer.prototype = {
  start: function () {
    // TODO deal with error handling on a long running process
    // what happens if this dies?
    // TODO break out the functions into testable units

    var self = this;
    var rule = new schedule.RecurrenceRule();
    rule.minute = 0; // runs hourly for now. We may want it to be daily.
    this.job = schedule.scheduleJob(rule, _.bind(self.generateDigests, self));
    _.bind(self.generateDigests, self)();
    logger.info('PrayerUpdateDigestProducer started');
  },

  generateDigests : function () {
    var self = this;
    logger.info('Preparing to create digests of prayer updates.');
    var allUpdates, allAuthors, allSubscribers, allDigests;
    app.adapter.findMany('prayerUpdate', {subscribersNotified : false})
      .then(function (updates) {
        // group the updates by the authors they deal with.
        allUpdates = updates;
        logger.info('fetching authors');
        return _.pluck(_.pluck(updates, 'links'), 'author');
      })
      .then(function (authorIds) {
        // for each author, enrich it with data
        logger.info('fetching author info');
        if(!_.isEmpty(authorIds)) {
          return app.adapter.findMany(rn.user, authorIds);
        } else {
          return [];
        }
      })
      .then(function (authors) {
        // for each author get the list of subscribers
        allAuthors = _.map(authors, function (a) {
          var result = {
            id: a.id,
            name: a.name,
            email: a.email,
            profilePicture: a.profilePicture
          };

          if(a.profilePictureSnapshot) {
            result.profilePictureSnapshot = 'yes'; // for the job, we only need to know if this exists.
          }

          // filter out other attributes.
          return result;
        });

        logger.info('fetching subscribers');
        return authors.map(
          function (author) {
            return app.adapter.findMany('subscriber', {object: author.id});
          });
      })
      .then(function (promiseToGetSubscribers) {
        // for each subscriber, collect the updates relevant to them in chronological order
        logger.info('creating digests');

        return RSVP.all(promiseToGetSubscribers).then(function (subscriberLists) {
          allSubscribers = _.flatten(subscriberLists);
          return _.uniq(allSubscribers, 'email').map(function (uniqueSubscriber) {
            // drop the unnecessary profile picture
            uniqueSubscriber = _.omit(uniqueSubscriber, 'profilePictureSnapshot');
            // get the authors for this subscriber
            var followedAuthors = _.uniq(_.pluck(_.pluck(_.where(allSubscribers, {email: uniqueSubscriber.email}), 'links'), 'object')
              .map(function (id) {
                // need to coerce to string type
                return String(id);
              }));

            var updates = followedAuthors.map(function (author) {
              // custom function since we cannot do exact memory match
              var updatesForAuthor = _.filter(allUpdates, function (update) {
                return update.links.author == author;
              });

              // updates are grouped by author.
              return {
                author: _.find(allAuthors, function (a) { return a.id == author; }),
                updatesForAuthor: updatesForAuthor
              };
            });

            return {
              subscriber: uniqueSubscriber,
              updates: updates
            };
          });
        });
      })
      .then(function (digests) {
        logger.info('creating notification job for digests');
        allDigests = digests;
        // create the notification job for each subscriber.
        _.each(digests, function (digest) {
          var context = {
            title: 'Prayer Updates',
            updates: digest.updates,
            name: digest.subscriber.name
          };

          // Schedule a job to mail the user.
          var task = {
            title: self.taskName + ' (' + digest.subscriber.email + ')',
            transport: 'email',
            context: context,
            recipient: digest.subscriber.email,
            template: self.template
          };

          self.notificationKue.create(self.taskName, task)
            .priority('high').attempts(1).save(function () {
              logger.info('created tasks to update subscribers');
            });
        });


        // last step is marking each update notified
        // it's better to get no notification than to get 2 notifications
        // for the same thing.
        return RSVP.all(_.map(allUpdates, function (update) {
           return app.adapter.update('prayerUpdate', update.id, {subscribersNotified: true});
        }));
      })
      .then(function (result) {
        logger.debug(result);
        logger.info('Successfully created prayer update digests.');
      })
      .catch(function (error, description) {
        logger.error('Failed to produce prayer update digest', error, description);
      });
  },

  itIsTimeToSendNotification: function () {
    // TODO make this configurable on a per use level
    // TODO take into account time zone
    var currentHour = new Date().getHours();
    return currentHour === this.notificationTime;
  }
};

module.exports = PrayerUpdateDigestProducer;


