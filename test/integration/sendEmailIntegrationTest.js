'use strict';

var email = require('../../worker/notifier/transports/email');

describe('Ensure e-mail class can send e-mail', function () {
  it('Should successfully send an e-mail', function (done) {
    this.timeout(10000);
    var recipient = 'kirisu@gmail.com';
    var subject = 'Pray for yourself';
    var message = '<h1>Pray for yourself</h1><p>You will never not need God&rsquo;s help. He loves you--seek His face!</p>';
    return email.sendMail(recipient, subject, message).should.eventually.be.fulfilled.and.notify(done);
  });
});

