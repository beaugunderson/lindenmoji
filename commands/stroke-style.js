'use strict';

var palette = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple'
];

exports.arguments = ['1-' + palette.length];
exports.symbols = ['🎨'];
exports.tags = ['drawing'];
var index = exports.index = 0;

exports.draw = function lineDraw(state, previousState, ctx, color) {
  if (color >= 1) {
    ctx.strokeStyle = palette[(color - 1) % palette.length];
  } else {
    ctx.strokeStyle = palette[index++ % palette.length];
  }
};
