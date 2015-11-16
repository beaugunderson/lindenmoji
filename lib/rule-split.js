'use strict';

var pegjs = require('pegjs-import');

var parser = pegjs.buildParser('./parsers/rule-body.pegjs');

module.exports = function (string) {
  return parser.parse(string);
};
