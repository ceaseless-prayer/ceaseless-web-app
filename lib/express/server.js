'use strict';

var http = require('http');

function Server(app) {
  return http.createServer(app).listen(app.get('port'));
}

module.exports = Server;
