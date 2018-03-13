'use strict';

var handlebars = require('handlebars')
  , moment = require('moment')
  , _ = require('lodash')
  , fs = require('fs');

function convertArrayIntoRows(arr, width) {
  if (_.isEmpty(arr) || width < 1) {
    return [];
  }

  var rows = [];
  var row = [];

  arr.forEach(function (val, i) {
    row.push(val);
    if ((i + 1) % width === 0) {
      rows.push(row);
      row = [];
    }
  });

  if (!_.isEmpty(row)) {
    rows.push(row);
  }

  return rows;
}

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
handlebars.registerHelper('dateFormat', function (context, block) {
  if (moment) {
    var f = block.hash.format || 'hh:mm A - DD MMM YY';
    return moment(context).format(f);
  } else {
    return context; //  moment plugin not available. return data as is.
  }
});

/**
 * Loads up a template which can be applied with a context to
 * generate html.
 * @param layout
 * @param partials
 * @returns {{render: Function}}
 */
module.exports = function (layout, partials) {
  _.forEach(partials, function (partial) {
    handlebars.registerPartials(partial.name,
      fs.readFileSync(partial.file, {encoding: 'utf-8'}));
  });
  var templateFile = fs.readFileSync(layout, {encoding: 'utf-8'});
  var template = handlebars.compile(templateFile);

  return {
    render: function (context) {
      return template(context);
    },
    convertArrayIntoRows: convertArrayIntoRows
  };
};
