'use strict';

exports.arguments = ['number'];
exports.symbols = ['⭕️', 'O'];
exports.tags = ['drawing'];

// TODO: add circleMove which draws from edge to edge and moves the cursor

var defaults = exports.defaults = {
  size: 5
};

exports.draw = function circleDraw(state, previousState, ctx, size) {
  ctx.beginPath();

  ctx.arc(state.x, state.height - (state.y + state.yOffset),
          state.scale * (size || defaults.size), 0, 2 * Math.PI);

  ctx.stroke();
};
