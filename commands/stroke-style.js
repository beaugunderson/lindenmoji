'use strict';

var palette = exports.palette = [
  '#ff0dff', '#e80c7a',
  '#94eed5', '#f3fee2',
  '#fee69c', '#96f3f8',
  '#be5fe3', '#49e2af',
  '#f45fba', '#f3d2e5',
  '#c9c2c0', '#989ae9',
  '#55c0c4', '#b59bd5',
  '#2090fb', '#c3b0e8'
];

exports.arguments = ['1-' + palette.length];
exports.symbols = ['🎨'];
exports.tags = ['drawing'];
var index = exports.index = 0;

exports.draw = function drawStrokeStyle(state, previousState, globals, ctx, color) {
  if (color >= 1) {
    ctx.strokeStyle = palette[(color - 1) % palette.length];
  } else {
    ctx.strokeStyle = palette[index++ % palette.length];
  }
};
