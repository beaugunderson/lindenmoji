'use strict';

var color = require('onecolor');

exports.arguments = ['0.0-1.0'];
exports.symbols = ['🌝'];
exports.tags = ['appearance'];

exports.draw = function drawStrokeOpacity(state, previousState, globals, ctx, opacity) {
  state.strokeOpacity = opacity || 1;

  ctx.strokeStyle = color(state.strokeColor)
    .alpha(state.strokeOpacity)
    .cssa();
};
