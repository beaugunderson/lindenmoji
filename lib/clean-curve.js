'use strict';

var parse = require('./parse-curve.js');
var ruleSplit = require('./rule-split.js');
var _ = require('lodash');

// TODO: remove unused rules (via recursive descent from initial state)
module.exports = function (curveString, ruleSymbols) {
  var curve = parse(curveString);

  var toRemove = {};

  _.each(curve.rules, function (r, symbol) {
    // don't process settings
    if (!_.includes(ruleSymbols, symbol)) {
      return;
    }

    var ruleString = r.map(function (command) {
      return command.command + command.args.join('');
    }).join('');

    var splitRule = ruleSplit(ruleString);

    if (splitRule.length === 1) {
      // the rule is a no-op
      if (splitRule[0] === symbol) {
        toRemove[symbol] = true;
      // the rule just references another rule, dereference it
      } else if (_.includes(ruleSymbols, splitRule[0])) {
        toRemove[symbol] = splitRule[0];
      }
    }
  });

  function resolve(s) {
    // remove
    if (toRemove[s] === true) {
      return null;
    }

    // dereference
    if (toRemove[s]) {
      return toRemove[s];
    }

    return s;
  }

  var rulesString = _(curve.rules)
    .map(function (r, symbol) {
      var ruleString;

      if (!_.includes(ruleSymbols, symbol)) {
        return symbol + '=' + r.join('');
      }

      if (toRemove[symbol]) {
        return null;
      }

      ruleString = r.map(function (command) {
        return command.command + command.args;
      }).join('');

      var removed = _(ruleSplit(ruleString))
        .map(resolve)
        .compact()
        .value();

      if (!removed.length) {
        return null;
      }

      return symbol + '=' + removed.join('');
    })
    .compact()
    .value()
    .join('; ');

  var oldString;

  // remove commands that cancel each other out
  while (oldString !== rulesString) {
    oldString = rulesString;

    rulesString = rulesString
      .replace(/↩️↪️/g, '')
      .replace(/↪️↩️/g, '')
      .replace(/\[\]/g, '');
  }

  var initialString = curve.initial.map(function (command) {
    return command.command + command.args.join('');
  }).join('');

  initialString = _(ruleSplit(initialString))
    .map(resolve)
    .compact()
    .value()
    .join('');

  return [
    initialString,
    rulesString
  ].join('; ');
};
