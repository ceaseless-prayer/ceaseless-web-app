'use strict';

var fortune = require('fortune')
  , config = require('../../../config')
  , auth = require('../auth')
  , rn = config.get('auth:resourceNames');

var app = fortune({
  adapter: 'mongodb'
});

// Define configuration resources

app.resource('configuration', {
  key: String,
  value: String,
  owner: {ref: rn.user }
}).transform(auth.isAuthorized, auth.isAuthorized)
;

module.exports = {
  app: app
};
