'use strict';

var pegjs = require('pegjs-import');
var parser = pegjs.buildParser('./parsers/curve.pegjs');

module.exports = function (curve) {
  return parser.parse(curve.replace(/\s/g, ''));
};
