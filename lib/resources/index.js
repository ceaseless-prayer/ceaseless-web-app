'use strict';

var fortune = require('fortune')
, auth = require('./auth')
, prayer = require('./prayer')
, configurationResource = require('./configuration')
, scripture = require('./scripture/votd');

var ceaselessApi = fortune({
  adapter: 'mongodb'
})
.use(auth.authMiddleware.authenticate)
.use(auth.authMiddleware.logout)
.use(auth.authMiddleware.forgotPassword)
.use(auth.authMiddleware.compactCollections)
.use(auth.app.router)
.use(prayer.app.router)
.use(scripture.verseOfTheDay)
.use(scripture.getScripture)
.use(scripture.getAScriptureImage)
.use(prayer.waysToPray.suggestedWayToPray)
.use(prayer.publicAccess.publicProfile)
.use(prayer.publicAccess.profilePicture)
.use(prayer.publicAccess.statusPicture)
.use(prayer.publicAccess.loadImage)
.use(prayer.publicAccess.prayedFor)
.use(configurationResource.app.router)
.resource('metric', {
  event: String,
  subject: String, /* Who is it about? */
  details: String, // Serialized JSON of details
  time: Date
}).readOnly().noIndex();

module.exports = ceaselessApi;
