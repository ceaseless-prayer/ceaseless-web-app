'use strict';

var fortune = require('fortune')
, config = require('../../../config')
, transformers = require('./routeTransformers')
, middleware = require('./middleware')
, rn = config.get('auth:resourceNames');

var app = fortune({
  adapter: 'mongodb'
});

var transformers = transformers(app, rn.user, rn.token);

// Define authentication resources
var userResource = app.resource(rn.user, {
  name: String,
  password: String,
  email: String,
  firstName: String,
  lastName: String,
  profilePicture: String,
  profilePictureSnapshot: String,
  description: String,
  tokens: [rn.token]
})
.transform(transformers.beforeStoringUser, transformers.afterFetchingUser);

var tokenResource = app.resource(rn.token, {
  owner: rn.user,
  value: String,
  expiration: Date
})
.transform(transformers.isAuthorized, transformers.isAuthorized)
.noIndex();

module.exports = {
  app: app,
  authMiddleware: middleware(app, rn.user, rn.token),
  isAuthorized: transformers.isAuthorized,
  passThroughAuthorizedResources: transformers.passThroughAuthorizedResources,
  userResource: userResource,
  tokenResource: tokenResource
};
