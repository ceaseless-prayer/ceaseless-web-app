'use strict';

var kue = require('kue')
, config = require('../config');

// Note: This must be run from the root of the project
// for the configuration to be properly picked up.
var port = config.get('kue:server:port');
kue.app.listen(port);
kue.app.set('title', 'Ceaseless');
console.log('listening to port', port);
