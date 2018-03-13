'use strict';

var _ = require('lodash');

var waysToPray = [
  { suggestion: 'Ask God how to pray for this person', tags: [] },
  { suggestion: 'thank God for this person', tags: [] },
  { suggestion: 'thank God for his grace in this person\'s life', tags: [] },
  { suggestion: 'Ask God to give them grace and peace', tags: [] },
  { suggestion: 'Ask God to motivate them for his purpose', tags: [] },
  { suggestion: 'Ask God to fulfill his purpose for them', tags: [] },
  { suggestion: 'Ask God to exalt Jesus in their life', tags: [] },
  { suggestion: 'Ask God to renew their strength', tags: [] },
  { suggestion: 'Ask God to increase their knowledge of him', tags: [] },
  { suggestion: 'Ask God to give them abundant life', tags: [] },
  { suggestion: 'Ask God to be their help amidst their trials', tags: [] },
  { suggestion: 'Ask God to give them a heart to know and seek him wholeheartedly', tags: [] },
  { suggestion: 'Ask God to show them his plan for their life', tags: [] },
  { suggestion: 'Ask God to direct their paths', tags: [] },
  { suggestion: 'Ask God to show them steadfast love and faithfulness', tags: [] },
  { suggestion: 'Ask God that his kindness would be effective in this person\'s life.', tags: [] }
];

var middleware = function (app) {
  return {
    suggestedWayToPray : function (req, res, next) {
      if (!req.path.match(/suggestedWayToPray/i)) {
        return next();
      }
      res.send(waysToPray[_.random(waysToPray.length)]);
    },
    socialStatus: function (req, res, next) {
      if (!req.path.match(/socialStatus/i)) {
        return next();
      }
      // TODO this stub should fetch FB status updates if appropriate
      next();
    }
  };
};

module.exports = middleware;