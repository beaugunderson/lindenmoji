'use strict';

var pegjs = require('pegjs-import');

var parser = pegjs.buildParser('./parsers/unicode-and-emoji.pegjs');

module.exports = function (string) {
  return parser.parse(string);
};
