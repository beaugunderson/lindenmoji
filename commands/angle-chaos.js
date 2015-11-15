'use strict';

exports.arguments = ['0.01-0.1'];
exports.symbols = ['🍥'];
exports.tags = ['setting'];

var defaults = exports.defaults = {
  angle: 0.01
};

exports.apply = function applyAngleChaos(state, angleChaos) {
  state.angleChaos = angleChaos || defaults.angleChaos;
};
