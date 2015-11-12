'use strict';

var pegjs = require('pegjs-import');

var parser = pegjs.buildParser('./parsers/emoji.pegjs');

module.exports = function (string) {
  try {
    parser.parse(string);
  } catch (e) {
    return false;
  }

  return true;
};
