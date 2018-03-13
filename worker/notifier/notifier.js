'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));

var producer, sender, digestProducer, digestSender, jobCleaner;
var runAll = argv.runAll;

if(argv.produce || runAll) {
  console.log('starting producer');
  var NotificationProducer = require('./NotificationProducer');
  producer = new NotificationProducer();
  setTimeout(_.bind(producer.start, producer), 2000);
}

if(argv.send || runAll) {
  console.log('starting sender');
  var NotificationSender = require('./NotificationSender');
  sender = new NotificationSender();
  setTimeout(_.bind(sender.start, sender), 2000);
}

if(argv.produceDigest || runAll) {
  console.log('starting digest producer');
  var PrayerUpdateDigestProducer = require('./PrayerUpdateDigestProducer');
  digestProducer = new PrayerUpdateDigestProducer();
  setTimeout(_.bind(digestProducer.start, digestProducer), 2000);
}

if(argv.sendDigest || runAll) {
  console.log('starting digest sender');
  var PrayerUpdateDigestSender = require('./PrayerUpdateDigestSender');
  digestSender = new PrayerUpdateDigestSender();
  setTimeout(_.bind(digestSender.start, digestSender), 2000);
}

if(argv.cleanJobs || runAll) {
  console.log('starting job cleaner');
  var JobCleaner = require('./JobCleaner');
  jobCleaner = new JobCleaner();
}

if(Object.keys(argv).length < 2) {
  console.log('Usage: node notifier --produce --send --produceDigest --sendDigest');
}


