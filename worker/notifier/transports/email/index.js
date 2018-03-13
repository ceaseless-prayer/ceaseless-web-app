'use strict';

var nodemailer = require('nodemailer')
, config = require('../../../../config')
, logger = require('../../../../lib/logger/notifier')
, RSVP = require('rsvp');

var transport = nodemailer
    .createTransport(config.get('mail:protocol'), config.get('mail:config'));

var fromAddress = config.get('mail:fromAddress');

function sendMail(recipient, subject, message) {
  logger.info('Preparing to send a message from ' + fromAddress + ' to ' + recipient);
  var mailOptions = {
    from: fromAddress,
    to: recipient,
    subject: subject,
    generateTextFromHTML: true,
    html: message
  };
  return new RSVP.Promise(function (resolve, reject) {
    transport.sendMail(mailOptions, function (err, result) {
      if (err) {
        logger.error('Failed to send message', err);
        reject(err);
      } else {
        logger.info('Successfully sent message', result);
        resolve(result);
      }
    });
  });
}

module.exports = {
  sendMail : sendMail,
  close : function (callback)  { transport.close(callback); }
};