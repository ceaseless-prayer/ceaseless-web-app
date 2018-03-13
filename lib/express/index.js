'use strict';

var express = require('express')
, compress = require('compression')
, serveStatic = require('serve-static')
, config = require('../../config')
, helmet = require('helmet')
, resources = require('../resources')
, logger = require('../logger/webserver')
, app = express();

app.enable('trust proxy'); // in case we go behind proxy
app.set('port', process.env.PORT || config.get('express:port'));
app.get('/heartbeat', function (req, res) {
        res.json(200, 'API OK');
});

app.use(compress());
helmet.defaults(app);

app.use('/api', resources.router);
app.use('/v1', resources.router);

app.use(serveStatic('dist', { maxAge: config.get('express:staticCache') }));
app.use(serveStatic('app', { maxAge: config.get('express:staticCache') }));
app.use(serveStatic('app/bower_components', { maxAge: config.get('express:staticCache') }));

var httpServer = require('./server')(app);
module.exports = httpServer;
logger.info('running on port', app.get('port'));
