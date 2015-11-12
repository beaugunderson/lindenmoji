'use strict';

exports.arguments = [];
exports.symbols = ['↪️', '↪', '-'];
exports.tags = ['heading'];

var defaults = exports.defaults = {
  rotationAngle: 60
};

exports.apply = function rotateCW(state) {
  var resolved = state.angle || defaults.rotationAngle;

  state.heading -= resolved +
    state.random.floatBetween(resolved * state.angleChaos * -1.0,
                              resolved * state.angleChaos);
};
