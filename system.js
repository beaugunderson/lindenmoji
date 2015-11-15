'use strict';

var requireDirectory = require('require-directory');
var _ = require('lodash');

var system = {
  commands: {},
  controlSymbols: [],
  emojiSymbols: [],
  symbolsByTag: {},
  settings: {},
  tags: []
};

requireDirectory(module, './commands/', {
  visit: function (command) {
    var emojiSymbol = command.symbols[0];

    system.tags = _.uniq(system.tags.concat(command.tags));

    if (_.contains(command.tags, 'setting')) {
      command.symbols.forEach(function (symbol) {
        system.settings[symbol] = command;
      });
    } else {
      system.controlSymbols = system.controlSymbols.concat(command.symbols);
      system.emojiSymbols.push(emojiSymbol);

      command.symbols.forEach(function (symbol) {
        system.commands[symbol] = command;
      });
    }

    command.tags.forEach(function (tag) {
      system.symbolsByTag[tag] =
        (system.symbolsByTag[tag] || []).concat(emojiSymbol);
    });
  }
});

module.exports = system;
