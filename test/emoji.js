'use strict';

var emojis = require('emojilib');
var parser = require('../parser.js');
var _ = require('lodash');

require('chai').should();

var characters = _(emojis)
  .filter(function (emoji) {
    return emoji.char;
  })
  .map(function (emoji) {
    return emoji.char;
  })
  .value();

describe('the parser', function () {
  characters.forEach(function (emoji) {
    it('should parse ' + emoji, function () {
      var result = parser.parse(emoji + '5;' + emoji + '=A');

      result.initial[0].command.should.equal(emoji);
      result.initial[0].args.should.deep.equal([5]);
    });
  });
});
