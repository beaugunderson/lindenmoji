'use strict';

var updateBounds = require('../lib/update-bounds.js');

exports.arguments = ['number'];
exports.symbols = ['⬜️', 'S'];
exports.tags = ['drawing'];

// TODO: add squareMove which draws from edge to edge and moves the cursor

var defaults = exports.defaults = {
  size: 7.5
};

exports.apply = function squareApply(state, previousState, globals, size) {
  var resolved = (state.scale * (size || defaults.size)) / 2;

  updateBounds(globals, [
    [state.x - resolved, state.y - resolved],
    [state.x + resolved, state.y + resolved]
  ]);
};

exports.draw = function squareDraw(state, previousState, globals, ctx, size) {
  ctx.beginPath();

  var width = state.scale * (size || defaults.size);
  var height = state.scale * (size || defaults.size);

  var startX = state.x - (width / 2);
  var startY = state.height - (state.y + state.yOffset) - (height / 2);

  ctx.rect(startX, startY, width, height);

  ctx.stroke();
};
