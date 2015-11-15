'use strict';

exports.arguments = ['0-90'];
exports.symbols = ['📐', 'R'];
exports.tags = ['heading'];

var defaults = exports.defaults = {
  rotationAngle: 10
};

exports.apply = function rotate(state, previousState, globals, angle) {
  var resolved = angle || state.angle || defaults.rotationAngle;

  state.heading += resolved +
    state.random.floatBetween(resolved * state.angleChaos * -1.0,
                              resolved * state.angleChaos);
};
