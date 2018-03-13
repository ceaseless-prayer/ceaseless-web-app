/*jshint expr: true*/
'use strict';

var sinon = require('sinon')
    , rewire = require('rewire')
    , NotificationSender = rewire('./NotificationSender');

var notifier = null;

describe('NotificationSender', function () {
  before(function () {
    // keep the test clean of logging messages
    NotificationSender.__set__('logger', {
      info: function () {},
      warn: function () { console.log(arguments); },
      error: function () { console.log(arguments); }
    });

    NotificationSender.__set__('kue', {
      createQueue: function () {
        return { process: sinon.spy() };
      }
    });
  });

  describe('performing the task', function () {
    var job = {
      data: {
        recipient: { email: 'test@test.com', id: '123' },
        context: { members: [
          {id: 'member 1'},
          {id: 'member 2'}
        ]}
      }
    };

    var jobDone;

    beforeEach(function () {
      notifier = new NotificationSender();
      notifier.createAndSendMessage = sinon.stub().returns({
        then: function (cb) { cb(); }
      });
      notifier.createPrayerRecord = sinon.stub().returnsArg(1);
      notifier.updatePrayerCount = sinon.stub().returns(1);
      jobDone = sinon.spy();
    });

    it('should create a message', function (done) {
      notifier.performTask(job, jobDone).then(function () {
          notifier.createAndSendMessage.should.have.been.calledWith(job.data);
          jobDone.should.have.been.calledOnce;
          done();
        });
    });

    it('should create a record and update count for each member', function (done) {
      var task = job.data;
      notifier.performTask(job, jobDone).then(function () {
        notifier.createPrayerRecord.should.have.been.calledWith(task.recipient, sinon.match.any);
        notifier.createPrayerRecord.should.have.callCount(task.context.members.length);
        notifier.updatePrayerCount.should.have.callCount(task.context.members.length);
        jobDone.should.have.been.calledOnce;
        done();
      });
    });
  });

  describe('creating and sending a message from a task', function () {
    var emailSpy, templateSpy;
    beforeEach(function () {
      emailSpy = sinon.spy();
      templateSpy = sinon.spy();
      NotificationSender.__set__('email', {
        sendMail: emailSpy
      });

      NotificationSender.__set__('template', {
        render: templateSpy
      });

      notifier = new NotificationSender();
    });

    function simulateMembers(members) {
      return {
        recipient: {
          email: 'test@test.com'
        },
        context: {
          members: members
        }
      };
    }

    it('should create a simple subject with one member to pray for', function () {
      var task = simulateMembers([{
        firstName: 'chris',
        lastName: 'lim'
      }]);
      var expectedSubject = 'Pray for chris lim';

      notifier.createAndSendMessage(task);
      emailSpy.should.have.been.calledWith(sinon.match.string, expectedSubject, sinon.match.any);
    });

    it('should create a complex subject with multiple members to pray for', function () {
      var task = simulateMembers([{
        firstName: 'chris',
        lastName: 'lim'
      }, {
        firstName: 'friend',
        lastName: 'two'
      }]);
      var expectedSubject = 'Pray for chris lim and others';

      notifier.createAndSendMessage(task);
      emailSpy.should.have.been.calledWith(sinon.match.string, expectedSubject, sinon.match.any);
    });

    it('should set the message by applying a template', function () {
      var task = simulateMembers([{
        firstName: 'chris',
        lastName: 'lim'
      }]);
      notifier.createAndSendMessage(task);
      templateSpy.should.have.been.calledWith(task.context);
    });

    it('should send the email', function () {
      var task = simulateMembers([{
        firstName: 'chris',
        lastName: 'lim'
      }]);
      notifier.createAndSendMessage(task);
      emailSpy.should.have.been.calledOnce;
    });
  });

  describe('creating a prayer record', function () {
    var createSpy;
    before(function () {
      createSpy = sinon.stub().returns({
        then: function (cb) {
          cb();
        }
      });
      NotificationSender.__set__('app', {
        adapter : {
          create : createSpy
        }
      });

      notifier = new NotificationSender();
    });

    it('should add a prayer record to the database', function () {
      var intercessor = {
        id: '123'
      };
      var member = {
        id: '234'
      };
      var expected = {
        createDate: sinon.match.date,
        links: {
          intercessor: intercessor.id,
          member: member.id
        }
      };

      notifier.createPrayerRecord(intercessor, member);
      createSpy.should.have.been.calledWith('prayerRecord', expected);
    });
  });

  describe('updating the count of prayer for a member', function () {
    var incrementSpy = sinon.stub().returns({
      then: function (cb) {
        cb();
      }
    });
    // TODO this test belongs in a lower layer
    before(function () {
      NotificationSender.__set__('app', {
        adapter : {
          increment : incrementSpy
        }
      });

      notifier = new NotificationSender();
    });
    it('should increment prayer count for the member id', function () {
      var member = {
        id: '123'
      };
      notifier.updatePrayerCount(member);
      incrementSpy.should.have.been.calledWith('member', member.id, 'prayedFor', 1);
    });
  });
});