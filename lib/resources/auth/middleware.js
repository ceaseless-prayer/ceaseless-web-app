'use strict';

var crypto = require('crypto')
    , bcrypt = require('bcryptjs')
    , _ = require('lodash')
    , RSVP = require('rsvp')
    , logger = require('../../logger/webserver');

var middleware = function (app, userResourceName, tokenResourceName) {
  return {
    // checks if a user exists
    userExists: function (req, res, next) {
      if (!req.path.match(/userExists/i)) {
        return next();
      }

      app.adapter.find(userResourceName, { name: name })
          .then(function (user) {
            if (_.isEmpty(user)) {
              res.send(404);
            } else {
              res.send(200);
            }
          });
    },

    // HACK for resources that are using auth.passThroughAuthorizedResources
    // we should discard elements that are null
    // TODO remove this when that hack is removed
    compactCollections: function (req, res, next) {
      // array of paths to do this on
      var paths = ['members', 'intercessors', 'notes', 'prayerRecords', 'subscribers', 'prayerUpdates', 'messages'];
      paths.forEach(function (resource) {
        if (req.path.match(new RegExp(resource, 'i'))) {
          var send = res.send;
          res.send = function (code, string) {
            var body = string instanceof Buffer ? string.toString() : string;
            if (code === 200) {
              body = JSON.parse(body);
              if(body[resource].length > 0) {
                body[resource] = _.compact(body[resource]);
              }
              body = JSON.stringify(body);
            }
            send.call(this, code, body);
          };
        }
      });
      return next();
    },

    // Define the authentication middleware
    authenticate: function (req, res, next) {
      if (!req.path.match(/authenticate/i)) {
        return next();
      }

      // get details (assume json)
      // TODO abstract away the vagaries of angular's $resource output
      var name, password;
      try {
        name = req.body.name;
        password = req.body.password;
      } catch (error) {
        logger.info('400 Bad Request in Attempt to authenticate', error);
        res.send(400);
      }

      // token management
      var email, id;
      app.adapter.find(userResourceName, { name: name })
          .then(function (user) {
            if (!validPassword(password, user.password)) {
              logger.info('Failed to authenticate user ', user.name);
              return res.send(401);
            } else {
              email = user.email;
              id = user.id;
              return generateToken(user);
            }
          }, function (error) {
            logger.info('User does not exist ', name, error);
            res.send(403);
          })
          .then(function (token) {
            var promises = {
              intercessor: app.adapter.find('intercessor', {email: email, owner: id}),
              member: app.adapter.find('member', {email: email, owner: id})
            };

            // if this user is also a member or intercessor
            // attach these ids as well.
            RSVP.hash(promises).then(function (results) {
              token.identities = results;
              res.send(200, token);
            }, function (e) {
              // with no identities, we can still give the token.
              res.send(200, token);
            });
          }, function () {
            res.send(500);
          });

      function validPassword(input, expected) {
        return bcrypt.compareSync(input, expected);
      }

      function generateToken(user) {
        var now = new Date();
        var token = {
          value: crypto.randomBytes(Math.pow(2, 6)).toString('base64'),
          expiration: now.setHours(now.getHours() + 2),
          links: {
            owner: user.id
          }
        };
        return app.adapter.create(tokenResourceName, token);
      }
    },

    refreshToken: function (req, res, next) {
      // TODO
    },

    logout: function (req, res, next) {
      if (!req.path.match(/logout/i)) {
        return next();
      }

      var token = req.get('Authorization');
      app.adapter.find(tokenResourceName, {value: token})
          .then(function (token) {
            // TODO ensure token is deleted
            app.adapter.delete(tokenResourceName, token.id);
            res.send(200);
          }, function (error) {
            logger.info('Failed to logout user', error);
            res.send(500);
          });
    },

    forgotPassword: function (req, res, next) {
      if (!req.path.match(/forgotPassword/i)) {
        return next();
      }
      // TODO send a forgotten password e-mail
      res.send(200);
    }
  };
};

module.exports = middleware;
