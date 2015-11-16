'use strict';

var color = require('onecolor');

exports.arguments = ['0.0-1.0'];
exports.symbols = ['🌞'];
exports.tags = ['appearance'];

exports.draw = function drawFillOpacity(state, previousState, globals, ctx, opacity) {
  state.fillOpacity = opacity || 1;

  ctx.fillStyle = color(state.fillColor)
    .alpha(state.fillOpacity)
    .cssa();
};
