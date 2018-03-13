'use strict';

var fortune = require('fortune')
    , config = require('../../../config')
    , rn = config.get('metrics:resourceNames')
    , middleware = require('./middleware');

var app = fortune({
  db: config.get('metrics:db:filename')
});

function addMetric (event, subject) {
  var metric = {
    event: event,
    subject: subject
  };
  return app.adapter.create(rn.metric, metric);
}

function getMetrics () {

}

module.exports = {
  addMetric : addMetric,
  getMetrics : getMetrics,
  metricMiddleware : middleware
};
