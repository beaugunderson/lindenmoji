'use strict';

var consoleFormat = require('./lib/console-format.js');
var split = require('./lib/unicode-split.js');
var system = require('./all-commands.js');
var _ = require('lodash');

function getArgument(symbol) {
  if (!system.commands[symbol].arguments || Math.random() < 0.05) {
    return '';
  }

  return system.commands[symbol].arguments.map(function (arg) {
    if (arg === 'style') {
      return "'red'";
    } else if (arg === 'number') {
      return _.random(1, 10);
    } else if (/^[0-9]/.test(arg)) {
      arg = arg.split('-');

      return _.random(parseInt(arg[0], 10), parseInt(arg[1], 10));
    }

    return '';
  }).join(',');
}

module.exports = function () {
  var angle = Math.round((180 / _.random(2, 16)) * 100) / 100;
  var controlWeight = _.random(0.3, 0.7);
  var index = 0;
  var remainingCharacters = 100;
  var rule;
  var rules = {};
  var start = '';
  var symbols = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // remove control symbols from potential symbols
  symbols = _.difference(symbols, system.controlSymbols);

  console.log('tags:', system.tags);
  console.log('symbols by tag:', system.symbolsByTag);

  console.log('available node symbols:', symbols.join(' '));
  console.log('available control symbols:', consoleFormat(system.emojiSymbols.join('')));

  var chosenSymbols = [];

  ['drawing', 'movement', 'heading'].forEach(function (tag) {
    chosenSymbols = chosenSymbols.concat(
      _.sample(system.symbolsByTag[tag],
               _.random(1, system.symbolsByTag[tag].length)));
  });

  console.log('chosen symbols:', consoleFormat(chosenSymbols.join('')));

  chosenSymbols = _.flatten(chosenSymbols.map(function (symbol) {
    // use multiple sets of arguments
    return _.times(_.random(1, 5), function () {
      return symbol + getArgument(symbol);
    });
  }));

  console.log('chosen symbols:', consoleFormat(chosenSymbols.join('')));

  var chosenSettings = [];

  ['setting'].forEach(function (tag) {
    chosenSettings = chosenSettings.concat(
      _.sample(system.symbolsByTag[tag],
               _.random(1, system.symbolsByTag[tag].length)));
  });

  console.log('chosen settings:', consoleFormat(chosenSettings.join('')));

  chosenSettings = chosenSettings.map(function (symbol) {
    return symbol + getArgument(symbol);
  });

  console.log('chosen settings:', consoleFormat(chosenSettings.join('')));

  function randomSymbol() {
    return Math.random() > controlWeight ?
      _.sample(nodeSymbols) :
      _.sample(chosenSymbols);
  }

  var ruleCount = _.random(1, 7);

  // select some symbols to use as nodes
  var nodeSymbols = _.take(symbols, ruleCount);

  remainingCharacters -= (5 * nodeSymbols.length);

  console.log('rule symbols:', nodeSymbols.join(' '));

  // generate random start symbol (small)
  var initialCount = _.random(2, 10);

  remainingCharacters -= initialCount;

  // start += _.times(initialCount, randomSymbol).join('');
  start += _.sample(nodeSymbols, initialCount).join('');

  console.log('start:', start);

  var avgLength = Math.floor(remainingCharacters / nodeSymbols.length);

  // generate a rule for each symbol
  for (var i = 0; i < nodeSymbols.length && remainingCharacters > 0; i++) {
    rule = '';

    // insert random node or control symbols
    _.times(_.random(Math.min(avgLength, remainingCharacters)), function () {
      rule += randomSymbol();
    });

    var ruleArray = split(rule);
    var bracketPairsToAdd = _.random(Math.floor(ruleArray.length / 6));

    // insert push/pop symbols, which need to be matched
    if (ruleArray.length > 1 && bracketPairsToAdd > 0) {
      console.log('%s rule: %s', nodeSymbols[i], consoleFormat(rule));

      _.times(bracketPairsToAdd, function () {
        index = _.random(ruleArray.length - 1);

        ruleArray = ruleArray.slice(0, index).concat('[',
          ruleArray.slice(index));

        index += _.random(2, ruleArray.length - index - 2);

        ruleArray = ruleArray.slice(0, index).concat(']',
          ruleArray.slice(index));
      });
    }

    if (ruleArray.length) {
      rule = ruleArray.join('');
      rules[nodeSymbols[i]] = rule;

      remainingCharacters -= ruleArray.length;

      console.log('%s rule: %s', nodeSymbols[i], consoleFormat(rule));
    }
  }

  rules = _.map(rules, function (r, symbol) {
    return symbol + '=' + r;
  }).join('; ');

  rules = rules.replace(/\[\]/g, '');

  var curve = [
    start,
    rules,
    '📐=' + angle
  ];

  // TODO: switch to alternate settings format
  if (chosenSettings) {
    curve.push('⚙=' + chosenSettings);
  }

  return curve.join('; ');
};
