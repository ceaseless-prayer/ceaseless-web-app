'use strict';

var fortune = require('fortune')
  , RSVP = fortune.RSVP
  , _ = require('lodash');

var transformers = function (app, userResourceName, tokenResourceName) {
  function beforeCreatingNote() {
    // TODO: "bump" feature
    this.timestamp = new Date();
    return this;
  }

  // TODO remove this duplicate code when you figure out the proper security model for notes
  function checkUserAndToken(id, request) {
    return new RSVP.Promise(function (resolve, reject) {
      var user
        , authorization = request.get('Authorization');
      if (!authorization) {
        return reject();
      }

      app.adapter.find(userResourceName, id)
        .then(function (resource) {
          user = resource;
          return app.adapter.findMany(tokenResourceName, resource.links.tokens);
        }, reject)
        .then(function (tokens) {
          var tokenFound = false;
          if(!_.isEmpty(tokens)) {
            tokens.forEach(function (token) {
              if (token.value === authorization) {
                tokenFound = true;
                resolve(user);
              }
            });
          }
          if (!tokenFound) {
            reject();
          }
        }, reject);
    });
  }

  // only the author of the note can see it
  // only return notes relevant for the member under inspection.
  function afterFetchingNote(request) {
    var resource = this;
    this.timestamp = this.timestamp instanceof Date ?
      this.timestamp.getTime() : null;
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(resource.links.author, request)
        .then(function () {
          // When creating a resource we should return it.
          if(request.method === 'POST' && _.isEmpty(request.query.member)) {
            resolve(resource);
          }
          // When fetching a note only return it if it is for the member
          if(resource.links.member.toString() === request.query.member) {
            resource.good = true;
            resolve(resource);
          } else {
            resolve(void 0);
          }
        }, function () { resolve(void 0); } );
    });
  }

  function beforeCreatingUpdate(request) {
    var resource = this;
    resource.timestamp = new Date();
    resource.subscribersNotified = false;
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(resource.links.author, request)
        .then(function () {
          // When creating/deleting a resource we should return it.
          if((request.method === 'POST' || request.method === 'DELETE') && _.isEmpty(request.query.author)) {
            resolve(resource);
          }
        }, function () { resolve(void 0); } );
    });
  }

  // only return updates relevant for the person under inspection.
  function afterFetchingUpdate(request) {
    var resource = this;
    this.timestamp = this.timestamp instanceof Date ?
      this.timestamp.getTime() : null;
    return new RSVP.Promise(function (resolve, reject) {
      // When creating a resource we should return it.
      if(request.method === 'POST' && _.isEmpty(request.query.author)) {
        resolve(resource);
      }
      // When fetching an update only return it if it is for the author
      if(resource.links.author.toString() === request.query.author) {
        resource.good = true;
        resolve(resource);
      } else {
        resolve(void 0);
      }
    });
  }

  function beforeCreatingMessage() {
    var resource = this;
    resource.timestamp = new Date();
    return resource;
  }

  function afterFetchingMessage(request) {
    var resource = this;
    this.timestamp = this.timestamp instanceof Date ?
      this.timestamp.getTime() : null;
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(resource.links.user, request)
        .then(function () {
          // When creating a message we should return it.
          if(request.method === 'POST' && _.isEmpty(request.query.user)) {
            resolve(resource);
          }
          // When fetching a message only return it if it is for the user
          if(resource.links.user.toString() === request.query.user) {
            resource.good = true;
            resolve(resource);
          } else {
            resolve(void 0);
          }
        }, function () { resolve(void 0); } );
    });
  }

  // only return subscribers relevant for the intercessor.
  function afterFetchingSubscriber(request) {
    var resource = this;
    this.timestamp = this.timestamp instanceof Date ?
      this.timestamp.getTime() : null;
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(resource.links.object, request)
        .then(function () {
          // When creating a resource we should return it.
          if(request.method === 'POST' && _.isEmpty(request.query.object)) {
            resolve(resource);
          }
          // When fetching a subscriber only return it if it is for the user
          if(resource.links.object.toString() === request.query.object ||
            resource.email === request.query.email) {
            resource.good = true;
            resolve(resource);
          } else {
            resolve(void 0);
          }
        }, function () { resolve(void 0); } );
    });
  }

  // ?? only the intercessor the record belongs to can see it
  // only return the records relevant for the intercessor
  function afterFetchingRecord(request) {
    var resource = this;
    this.timestamp = this.timestamp instanceof Date ?
      this.timestamp.getTime() : null;
    // when a  person logs in, if they are intercessor,
    // their id ought to be saved for used in record creation.
    return new RSVP.Promise(function (resolve, reject) {
      // validations:
      // 1. Is the authorization token valid?
      // 2. Which user does the authorization token belong to?
      // 3. Does that user have permission to access this resource by being
      // 3a. The owner of the resource or
      // 3b. An intercessor who has permission to operate on the resource?
      app.adapter.find('intercessor', resource.links.intercessor)
        .then(function (intercessor) {
          app.adapter.find('user', {email: intercessor.email})
            .then(function (user) {
              checkUserAndToken(user.id, request)
                .then(function () {
                  // When creating a resource we should return it.
                  if(request.method === 'POST' && _.isEmpty(request.query.intercessor)) {
                    resolve(resource);
                  }
                  // When fetching a record only return it if it is for the intercessor
                  if(resource.links.intercessor.toString() === request.query.intercessor) {
                    resource.good = true;
                    resolve(resource);
                  } else {
                    resolve(void 0);
                  }
                }, function () { resolve(void 0); } );
            }, function () { resolve(void 0); } );
        }, function () { resolve (void 0); } );
    });
  }

  return {
    beforeCreatingNote: beforeCreatingNote,
    afterFetchingNote: afterFetchingNote,
    afterFetchingRecord: afterFetchingRecord,
    beforeCreatingUpdate: beforeCreatingUpdate,
    afterFetchingUpdate: afterFetchingUpdate,
    beforeCreatingMessage: beforeCreatingMessage,
    afterFetchingMessage: afterFetchingMessage,
    afterFetchingSubscriber: afterFetchingSubscriber
  };
};

module.exports = transformers;