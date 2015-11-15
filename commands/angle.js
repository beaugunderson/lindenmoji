'use strict';

exports.arguments = ['angle'];
exports.symbols = ['📐'];
exports.tags = ['setting'];

var defaults = exports.defaults = {
  angle: 60
};

exports.apply = function applyAngle(state, angle) {
  state.angle = angle || defaults.angle;
};
