'use strict';

var sinon = require('sinon')
  , _ = require('lodash')
  , rewire = require('rewire')
  , NotificationProducer = rewire('../../worker/notifier/NotificationProducer')
  , NotificationSender = rewire('../../worker/notifier/NotificationSender')
  , RSVP = NotificationProducer.__get__('RSVP');

/**
 * Note: there is a temporal/logical dependency between these two tests
 * The producer must put work on the kue in order for the consumer to get it.
 *
 * This is not an exhaustive test--it just exercises the main path of the logic
 * for verification that putting things and getting things off of the kue succeeds.
 *
 * Also, the end to end aspect of the test is time sensitive. (We may drop it).
 */
describe('Producing and consuming tasks', function () {
  this.timeout(13000);
  it('should put a job on the kue and consume it', function (done) {
    var intercessor = {
      id: '123',
      email: 'kirisu@gmail.com'
    };
    var members = [{
      id: '321',
      firstName: 'Chris',
      lastName: 'Lim'
    },{
      id: '654',
      firstName: 'Your',
      lastName: 'Name'
    }];
    var producer = new NotificationProducer();
    producer.createTaskForIntercessor(intercessor, members);

    var sender = new NotificationSender();
    sinon.spy(sender, 'performTask');
    sender.start();
    setTimeout(function () {
      sender.performTask.should.have.been.calledOnce;
      done();
    }, 5000);
  });
});

describe('Updating prayer counts', function () {
  this.timeout(20000);

  var producer, sender, app;
  var intercessor, member;

  before(function (done) {
    NotificationSender.__set__('email', {
      sendMail: function () {
        console.log('Faked sending e-mail');
        return new RSVP.Promise(function (resolve) {
          resolve();
        });
      }
    });

    producer = new NotificationProducer();
    sender = new NotificationSender();

    intercessor = {
      id: 'abcdefghijkl',
      email: 'kirisu@gmail.com'
    };
    member = {
      id: 'lkjihgfedcba',
      firstName: 'Your',
      lastName: 'Name'
    };

    app = NotificationProducer.__get__('app');
    // this is an integration test. timing matters
    // if we load too fast, the app won't pick up the resources.

    setTimeout(function () {
      console.log('Setting up fake data');
      RSVP.all([
        app.adapter.create('member', member.id, member),
        app.adapter.create('intercessor', intercessor.id, intercessor)
      ]).then(function () {
        // the creation used the 'id' field to generate an ObjectId.
        // it replaced the id field with _id.
        // we put the _id in the id field now.
        member.id = member._id;
        intercessor.id = intercessor._id;
        done();
      }, function (err) {
        console.log(err);
        done(err);
      });
    }, 1000);
  });

  after(function () {
    var cleanupIntercessor = app.adapter.delete('intercessor', intercessor.id);
    var cleanupMember = app.adapter.delete('member', member.id);
    RSVP.all([cleanupIntercessor, cleanupMember]).should.eventually.be.fulfilled;
  });

  it('should update the number of times prayed for a member and create a record', function (done) {
    producer.createTaskForIntercessor(intercessor, [member]);
    sinon.spy(sender, 'performTask');
    sender.start();
    // using a timeout to check after the queue has processed the work.
    setTimeout(function () {
      var memberUpdated = app.adapter.find('member', {id: member.id}).then(function (updatedMember) {
        var prayedFor = updatedMember.prayedFor;
        prayedFor.should.eql(1);
      });
      var recordCreated = app.adapter.find('prayerRecord', {intercessor: intercessor.id, member: member.id})
        .then(function (prayerRecord) {
          return should.exist(prayerRecord);
        });
      RSVP.all([memberUpdated, recordCreated]).then(function () {
        done();
      }).catch(done);
    }, 5000);
  });
});