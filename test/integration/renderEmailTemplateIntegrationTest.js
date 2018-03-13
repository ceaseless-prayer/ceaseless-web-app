'use strict';

var templater = require('../../worker/notifier/transports/email/templater')
  , fs = require('fs')
  , email = require('../../worker/notifier/transports/email');

describe('Ensure a template can be rendered', function () {
  var context = {
    members: [
      {firstName: 'Chris', lastName: 'Someone'},
      {firstName: 'Hi', lastName: 'friend'},
      {firstName: 'Bye', lastName: 'foe'}
    ],
    title: 'Suggested people to pray for:',
    scripture: {
      text: 'Blessed are they who keep his statutes and seek him with all their hearts.',
      citation: 'Psalm 119:2'
    }
  };

  // helper method used to send a test e-mail
  function sendRealEmail(done, self, message) {
    self.timeout(10000);
    var recipient = 'kirisu@gmail.com';
    var subject = 'Pray for yourself';
    return email.sendMail(recipient, subject, message).should.eventually.be.fulfilled.and.notify(done);;
  }

  it('Should successfully render the simple template given context', function () {
    var template = templater('worker/notifier/transports/email/templates/simple_email.html', []);

    var message = template.render(context);
    fs.writeFile('template_sample.html', message, function (error) {
      if (error) {
        console.log('Failed to write template_sample.html');
        throw error;
      }
      console.log('Wrote sample output to template_sample.html');
    });
    message.should.not.be.empty;
  });

  it('Should render the summer template', function (done) {
    var template = templater('worker/notifier/transports/email/templates/summer_email.html', []);
    context.memberRows = template.convertArrayIntoRows(context.members, 2);
    var message = template.render(context);
    fs.writeFile('summer_sample.html', message, function (error) {
      if (error) {
        console.log('Failed to write summer_sample.html');
        throw error;
      }
      console.log('Wrote sample output to summer_sample.html');
    });
    message.should.not.be.empty;
  });

  it('Should render the prayer update digest template', function (done) {
    var template = templater('worker/notifier/transports/email/templates/prayer_update_digest.html', []);
    var context = {
      "title":"Prayer Updates",
      "updates":[
        {"author":
          {
            "id":"53bf2af9e8f269fa1e9e883b",
            "name":"elderlim",
            "email":"kirisul@hotmail.com"
          },
          "updatesForAuthor":[
            {
              "id":"53f6a6bf3d791f71338856c5",
              "timestamp":"2014-08-22T02:01:11.080Z",
              "content":"Thankful for the great work Cici did on look and feel.",
              "type":"update",
              "subscribersNotified":false,
              "links":{
                "author":"53bf2af9e8f269fa1e9e883b"
              }
            },
            {
              "id":"53f6a6bf3d791f71338856c5",
              "timestamp":"2014-08-22T02:11:11.080Z",
              "content":"Another lengthy update to discuss?",
              "type":"update",
              "subscribersNotified":false,
              "links":{
                "author":"53bf2af9e8f269fa1e9e883b"
              }
            },
            {
              "id":"53f6a6bf3d791f71338856c5",
              "timestamp":"2014-08-22T02:11:20.080Z",
              "content":"And another update to share.",
              "type":"update",
              "subscribersNotified":false,
              "links":{
                "author":"53bf2af9e8f269fa1e9e883b"
              }
            },
            {
              "id":"53f6a6bf3d791f71338856c5",
              "timestamp":"2014-08-22T03:17:11.080Z",
              "content":"Pray sincerely for this person please!",
              "type":"update",
              "subscribersNotified":false,
              "links":{
                "author":"53bf2af9e8f269fa1e9e883b"
              }
            }
          ]
        }
      ]
    };

    var message = template.render(context);
    fs.writeFile('prayer_update_digest_sample.html', message, function (error) {
      if (error) {
        console.log('Failed to write prayer_update_digest_sample.html');
        throw error;
      }
      console.log('Wrote sample output to prayer_update_digest_sample.html');
    });
    message.should.not.be.empty;
  });
});

describe('Ensure complex template can be rendered', function () {
  var context = {
    "title":"Prayer Updates",
    "name": "Christopher Lim",
    "webPath": "http://localhost:3001/",
    "basePath": "http://localhost:3000/api/",
    "authorIds": "53bf2af9e8f269fa1e9e883b",
    "jobId" : "fakeId",
    "recipient" : "kirisul@hotmail.com",
    "updates":[
      {
        "author": {
          "id":"53bf2af9e8f269fa1e9e883b",
          "name":"elderlim",
          "email":"kirisul@hotmail.com",
          "profilePicture":"",
          "profilePictureSnapshot":"http://localhost:3000/api/profilePicture?entity=user&id=53bf2af9e8f269fa1e9e883b",
          "description":"Psalms in “Jamiekan” for liturgy and to expand popular oral expression"
        },
        "updatesForAuthor": [
          {
            "id":"53f6a6bf3d791f71338856c5",
            "timestamp":"2014-08-22T02:11:11.080Z",
            "content":"Thankful for the great work Cici did on look and feel.",
            "type":"update",
            "subscribersNotified":false,
            "links":{
              "author":"53bf2af9e8f269fa1e9e883b"
            }
          },
          {
            "id":"53fb7fd62709c0a204cf5d72",
            "timestamp":"2014-08-22T02:31:11.080Z",
            // this image is likely to be a data-uri, so instead of embedding
            // we use the id to construct an image url in the template.
            "image":"https://pbs.twimg.com/media/BvgxsQmCMAMUpXg.jpg:medium",
            "content":"Another lengthy update to discuss?",
            "type":"update",
            "subscribersNotified":false,
            "links":{
              "author":"53bf2af9e8f269fa1e9e883b"
            }
          },
          {
            "id":"53f6a6bf3d791f71338856c5",
            "timestamp":"2014-08-22T12:14:11.080Z",
            "content":"And another update to share.",
            "type":"update",
            "subscribersNotified":false,
            "links":{
              "author":"53bf2af9e8f269fa1e9e883b"
            }
          },
          {
            "id":"53f6a6bf3d791f71338856c5",
            "timestamp":"2014-08-22T17:01:11.080Z",
            "content":"Pray sincerely for this person please!",
            "type":"update",
            "subscribersNotified":false,
            "links":{
              "author":"53bf2af9e8f269fa1e9e883b"
            }
          }
        ]
      }
    ]
  };

  it('Should render the complex twitter-based template', function (done) {
    var template = templater('worker/notifier/transports/email/templates/twitter.html', []);

    var message = template.render(context);
    fs.writeFile('twitter_sample.html', message, function (error) {
      if (error) {
        console.log('Failed to write twitter_sample.html');
        throw error;
      }
      console.log('Wrote sample output to twitter_sample.html');
    });
    message.should.not.be.empty;
  });
});

