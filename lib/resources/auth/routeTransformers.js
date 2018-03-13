'use strict';

var fortune = require('fortune')
    , RSVP = fortune.RSVP
    , bcrypt = require('bcryptjs')
    , _ = require('lodash');

var transformers = function (app, userResourceName, tokenResourceName) {
  function beforeStoringUser(request) {
    var user = this
        , password = user.password
        , id = user.id || request.path.split('/').pop();

    // require a password on user creation
    if (request.method === 'POST') {
      if (!!password) {
        return hashPassword(user, password);
      } else {
        throw new Error('Password is required on user creation.');
      }
    }

    // update a user
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(id, request)
          .then(function (resource) {
            if (_.isEmpty(password)) {
              delete user.id;
              resolve(user);
            } else {
              // store the hash of the password
              user = hashPassword(user, password);

              clearTokens(resource.links.tokens).then(function () {
                resolve(user);
              }, reject);
            }
          }, reject);
    });
  }

  function afterFetchingUser(request) {
    var user = this;
    delete user.password;
    return new RSVP.Promise(function (resolve) {
      checkUserAndToken(user.id, request).then(function () {
        delete user.links;
        resolve(user);
      }, function () {
        delete user.links;
        resolve(user);
      });
    });
  }

  function clearTokens(tokens) {
    // TODO this needs to clean up links in the user
    return RSVP.all((tokens || []).map(function (id) {
      return app.adapter.delete(tokenResourceName, id);
    }));
  }

  function hashPassword(user, password) {
    // TODO convert to asynchronous for performance
    user.password = bcrypt.hashSync(user.password);
    return user;
  }

  function isAuthorized(request) {
    var resource = this;
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(resource.links.owner, request)
          .then(function () {
            resolve(resource);
          }, reject);
    });
  }

  // HACK TODO this is a temporary approach
  // to enabling only the resources a user owns to pass through
  // because the GET collection request was failing since
  // the underlying fortune engine can't support queries by owner yet
  function passThroughAuthorizedResources(request) {
    var resource = this;
    return new RSVP.Promise(function (resolve, reject) {
      checkUserAndToken(resource.links.owner, request)
          .then(function () {
            resource.good = true;
            resolve(resource);
          }, function () { resolve(void 0); } );
    });
  }

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

  return {
    isAuthorized: isAuthorized,
    passThroughAuthorizedResources: passThroughAuthorizedResources,
    beforeStoringUser: beforeStoringUser,
    afterFetchingUser: afterFetchingUser
  };
};

module.exports = transformers;
