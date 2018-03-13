'use strict';

var fortune = require('fortune')
  , config = require('../../../config')
  , auth = require('../auth')
  , transformers = require('./routeTransformers')
  , waysToPray = require('./waysToPray')
  , publicAccess =require('./publicAccess')
  , rn = config.get('auth:resourceNames');

var app = fortune({
  adapter: 'mongodb'
});

var transformers = transformers(app, rn.user, rn.token);
var waysToPray = waysToPray(app);
var publicAccess = publicAccess(app);

// Define prayer resources

app.resource('member', {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  facebook: String,
  address: String,
  enabled: Boolean,
  age: Number,
  gender: String,
  lastNote: String,
  lastNoteDate: Date,
  prayedFor: Number,
  invited: Array,
  profilePicture: String,
  profilePictureSnapshot: String,
  owner: { ref: rn.user }
}).transform(auth.passThroughAuthorizedResources, auth.passThroughAuthorizedResources)
.resource('intercessor', {
  firstName: String,
  lastName: String,
  gender: String,
  email: String,
  phone: String, // for texting
  // TODO eventually may need facebook account linking
  profilePicture: String,
  description: String,
  active: Boolean,
  transports: Array,
  owner: { ref: rn.user }
}).transform(auth.passThroughAuthorizedResources, auth.passThroughAuthorizedResources)
// TODO temporary for TSCO pilot. Eventually members should == subscribers in some ways.
.resource('subscriber', {
  object: { ref: rn.user },
  name: String,
  email: String,
  profilePicture: String,
  profilePictureSnapshot: String
}).after(transformers.afterFetchingSubscriber)
.resource('prayerRecord', {
  createDate: Date,
  intercessor: 'intercessor',
  member: 'member',
  completeDate: Date,
  memberNotified: Boolean
}).after(transformers.afterFetchingRecord)
.resource('note', {
  timestamp: Date,
  author: { ref: 'intercessor' },
  member: { ref: 'member' },
  content: String
}).transform(transformers.beforeCreatingNote, transformers.afterFetchingNote)
.resource('message', {
  timestamp: Date,
  sender: String,
  user: { ref: rn.user },
  content: String
}).transform(transformers.beforeCreatingMessage, transformers.afterFetchingMessage)
.resource('prayerUpdate', {
  timestamp: Date,
  // the reason why author is intercessor
  // is so that missionaries can give prayer updates
  // and also be praying for their supporters.
  author: { ref: rn.user },
  content: String,
  type: String,
  image: String,
  subscribersNotified: Boolean
}).transform(transformers.beforeCreatingUpdate, transformers.afterFetchingUpdate)
;

module.exports = {
  app: app,
  waysToPray: waysToPray,
  publicAccess: publicAccess
};
