'use strict';

exports.arguments = ['0.01-0.1'];
exports.symbols = ['〰️'];
exports.tags = ['setting'];

var defaults = exports.defaults = {
  distance: 0.01
};

exports.apply = function applyDistanceChaos(state, distanceChaos) {
  state.distanceChaos = distanceChaos || defaults.distanceChaos;
};
