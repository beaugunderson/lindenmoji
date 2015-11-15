'use strict';

var updateBounds = require('../lib/update-bounds.js');

exports.arguments = ['number'];
exports.symbols = ['⭕️', 'O'];
exports.tags = ['drawing'];

// TODO: add circleMove which draws from edge to edge and moves the cursor

var defaults = exports.defaults = {
  size: 5
};

exports.apply = function circleApply(state, previousState, globals, size) {
  var r = state.scale * (size || defaults.size);

  updateBounds(globals, [
    [state.x - r, state.y - r],
    [state.x + r, state.y + r]
  ]);
};

exports.draw = function circleDraw(state, previousState, globals, ctx, size) {
  var r = state.scale * (size || defaults.size);

  ctx.beginPath();

  ctx.arc(state.x, state.height - (state.y + state.yOffset), r, 0, 2 * Math.PI);

  ctx.stroke();
};
