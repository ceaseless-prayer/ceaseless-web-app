/*jshint expr: true*/
'use strict';

var sinon = require('sinon')
    , _ = require('lodash')
    , rewire = require('rewire')
    , NotificationProducer = rewire('./NotificationProducer');

var producer = null;
var RSVP = NotificationProducer.__get__('RSVP');

describe('NotificationProducer', function () {

  beforeEach(function () {
    producer = new NotificationProducer();
  });

  before(function () {
    // keep the test clean of logging messages
    NotificationProducer.__set__('logger', {
      info: function () {},
      warn: function () { console.log('WARN', arguments); },
      error: function () { console.log('ERROR', arguments); }
    });
    NotificationProducer.__set__('kue', {
      createQueue: function () {
        return { create: sinon.spy() };
      }
    });
  });

  describe('when deciding whether or not to create a task', function () {
    before(function () {
      NotificationProducer.__set__('schedule', {
        scheduleJob: function (freq, handler) {
          handler(); // immediately run the handler
        }
      });
    });

    var findUserCallbackStub, findUserStub, users;
    beforeEach(function () {
      users = [{id: '321'}, {id: '987'}];
      findUserCallbackStub = sinon.stub().callsArgWith(0, users);
      findUserStub = sinon.stub().returns({
        then: findUserCallbackStub
      });
      NotificationProducer.__set__('app', {
        adapter: {
          findMany: findUserStub
        }
      });
    });

    it('should not do the check if it is not the right time', function () {
      producer.itIsTimeToSendNotification = sinon.stub().returns(false);
      producer.start();
      findUserStub.should.have.callCount(0);
      producer.itIsTimeToSendNotification.should.have.been.calledOnce;
    });

    it('should create a task if the time is right', function () {

      var activeUsers = [{id:'321'}];
      var intercessors = [{id:'123'}];
      var members = [{id:'456'}];

      producer.itIsTimeToSendNotification = sinon.stub().returns(true);

      producer.getActiveUsers = sinon.stub().returns(activeUsers);
      producer.getIntercessors = sinon.stub().returns(intercessors);
      producer.getMembersToPrayFor = sinon.stub().returns(members);
      producer.createTaskForIntercessor = sinon.spy();

      producer.start();

      producer.itIsTimeToSendNotification.should.have.been.calledOnce;
      findUserStub.should.have.been.calledOnce;
      findUserCallbackStub.should.have.been.calledOnce;
      producer.getActiveUsers.should.have.been.calledWith(users);
      producer.getIntercessors.should.have.been.calledWith(activeUsers[0]);
      producer.getMembersToPrayFor.should.have.been.calledWith(activeUsers[0]);
      producer.createTaskForIntercessor.should.have.been.calledWith(intercessors[0], members);
    });
  });

  describe('getting active users', function () {

    var truePromise = new RSVP.Promise(function (resolve) {
       resolve(true);
    });
    var falsePromise = new RSVP.Promise(function (resolve) {
      resolve(false);
    });

    it('should return nothing if no users are active', function (done) {
      var users = [{id: '321'}, {id: '987'}];
      producer.userInstallationIsActive = sinon.stub();

      producer.userInstallationIsActive
        .onFirstCall().returns(falsePromise)
        .onSecondCall().returns(falsePromise);
      producer.getActiveUsers(users).then(function (result) {
        expect(result).to.deep.equal([]);
        producer.userInstallationIsActive.should.have.callCount(2);
        done();
      });
    });

    it('should return active users', function (done) {
      var users = [{id: '321'}, {id: '987'}];
      producer.userInstallationIsActive = sinon.stub();
      producer.userInstallationIsActive
        .onFirstCall().returns(falsePromise)
        .onSecondCall().returns(truePromise);

      producer.getActiveUsers(users).then(function (result){
        expect(result).to.deep.equal([users[1]]);
        producer.userInstallationIsActive.should.have.callCount(2);
        done();
      });
    });
  });

  describe('getting intercessors', function () {
    var intercessorStub;
    before(function () {
      NotificationProducer.__set__('app', {
        adapter: {
          findMany: function (resource, criteria) {
            return intercessorStub;
          }
        }
      });
    });

    it('should return an empty array if there is an error fetching', function (done) {
      var logger = NotificationProducer.__get__('logger');
      var logErrorStub = sinon.stub(logger, 'error');
      intercessorStub = new RSVP.Promise(function (resolve, reject) {
        reject('Error');
      });
      producer.getIntercessors({}).then(function (result) {
        expect(result).to.deep.equal([]);
        logErrorStub.should.have.been.calledOnce;
        logErrorStub.restore();
        done();
      });
    });

    it('should return intercessors belonging to the given user', function (done) {
      var intercessors = [{id: '123'}];
      intercessorStub = new RSVP.Promise(function (resolve, reject) {
        resolve(intercessors);
      });
      producer.getIntercessors({}).then(function (result) {
        expect(result).to.deep.equal(intercessors);
        done();
      });
    });
  });

  describe('creating a task for an intercessor', function () {
    it('should create a task context and queue the task', function () {
      function KueApi() {
        KueApi.prototype.priority = sinon.stub().returns(this);
        KueApi.prototype.attempts = sinon.stub().returns(this);
        KueApi.prototype.save = sinon.spy();
      }
      var mockKue = new KueApi();

      var intercessor = {
        email: 'test@test.com'
      };
      var members = [
        {id:'123'},
        {id:'321'}
      ];
      var expectedTask = {
        name: sinon.match.string,
        transport: 'email',
        context: {
          title: sinon.match.string,
          scripture: sinon.match.string,
          members: members
        },
        recipient: intercessor,
        template: 'templates/simple_email.html'
      };

      producer.notificationKue = {
        create: sinon.stub().returns(mockKue)
      };

      producer.createTaskForIntercessor(intercessor, members);
      producer.notificationKue.create.calledWith(sinon.match.string, expectedTask);
      mockKue.priority.should.have.been.calledOnce;
      mockKue.attempts.should.have.been.calledOnce;
      mockKue.save.should.have.been.calledOnce;
    });
  });

  describe('getting members to pray for', function () {
    var memberStub;
    before(function () {
      NotificationProducer.__set__('app', {
        adapter: {
          findMany: function (resource, criteria) {
            return memberStub;
          }
        }
      });
    });

    it('should return an empty array if an error occurred', function (done) {
      var logger = NotificationProducer.__get__('logger');
      var logErrorStub = sinon.stub(logger, 'error');
      memberStub = new RSVP.Promise(function (resolve, reject) {
        reject('Error');
      });

      producer.getMembersToPrayFor({}).then(function (result) {
        expect(result).to.deep.equal([]);
        logErrorStub.should.have.been.calledOnce;
        logErrorStub.restore();
        done();
      });
    });

    it('should return a list of members sorted ascending based on how many times they have been prayed for', function (done) {
      var allMembers = [
        {
          id: '1',
          prayedFor: 5
        },
        {
          id: '2',
          prayedFor: 2
        },
        {
          id: '3',
          prayedFor: 8
        },
        {
          id: '4',
          prayedFor: 1
        },
        {
          id: '5',
          prayedFor: 2
        }
      ];
      var expectedMembers = _.at(allMembers, 3, 1, 4);
      memberStub = new RSVP.Promise(function (resolve) {
        resolve(allMembers);
      });
      producer.membersPerDay = expectedMembers.length;
      producer.getMembersToPrayFor({}).then(function (members) {
        expect(members).to.deep.equal(expectedMembers);
        done();
      });

    });
  });

  describe('checking if it is time to send notifications', function (){
    var time, clock;
    before(function () {
      time = new Date();
      clock = sinon.useFakeTimers(time.getTime());
    });
    after(function () {
      clock.restore();
    });

    it('should return false if the hour of the day is not equal to the hour configured to send notifications', function () {
      producer.notificationTime = time.getHours() + 1;
      var result = producer.itIsTimeToSendNotification();
      expect(result).to.equal(false);
    });

    it('should return true if the hour is equal to the hour configured to send notifications', function () {
      producer.notificationTime = time.getHours();
      var result = producer.itIsTimeToSendNotification();
      expect(result).to.equal(true);
    });
  });

  describe('checking if an installation is active', function () {
    var configStub;
    before(function () {
      NotificationProducer.__set__('app', {
        adapter: {
          find: function (resource, criteria) {
            return configStub;
          }
        }
      });
    });

    it('should return whether or not the user has activated their installation', function (done) {
      configStub = new RSVP.Promise(function (resolve, reject) {
        resolve({ isActive: true });
      });
      producer.userInstallationIsActive({}).then(function (active) {
        expect(active).to.equal(true);
        done();
      });
    });

    it('should return false if an error occurred (failsafe)', function (done) {
      var logger = NotificationProducer.__get__('logger');
      var logErrorStub = sinon.stub(logger, 'error');
      configStub = new RSVP.Promise(function (resolve, reject) {
        reject('Error');
      });
      producer.userInstallationIsActive({}).then(function (result) {
        expect(result).to.equal(false);
        logErrorStub.should.have.been.calledOnce;
        logErrorStub.restore();
        done();
      });
    });
  });
});