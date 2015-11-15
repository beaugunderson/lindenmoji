'use strict';

var square = require('./square.js');

exports.arguments = square.arguments;
exports.symbols = ['⬛️'];
exports.tags = square.tags;

exports.apply = square.apply;

exports.draw = function squareFilledDraw(state, previousState, globals, ctx, size) {
  square.draw.apply(this, arguments);

  ctx.fill();
};
