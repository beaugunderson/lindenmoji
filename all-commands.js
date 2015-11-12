'use strict';

var requireDirectory = require('require-directory');
var _ = require('lodash');

module.exports = {
  commands: {},
  controlSymbols: [],
  emojiSymbols: [],
  symbolsByTag: {},
  tags: []
};

requireDirectory(module, './commands/', {
  visit: function (command) {
    var symbol = command.symbols[0];

    module.exports.tags = _.uniq(module.exports.tags.concat(command.tags));
    module.exports.controlSymbols = module.exports.controlSymbols
      .concat(command.symbols);
    module.exports.emojiSymbols.push(symbol);
    module.exports.commands[symbol] = command;

    command.tags.forEach(function (tag) {
      module.exports.symbolsByTag[tag] =
        (module.exports.symbolsByTag[tag] || []).concat(symbol);
    });
  }
});
