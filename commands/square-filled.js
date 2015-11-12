'use strict';

var square = require('./square.js');

exports.arguments = square.arguments;
exports.symbols = ['⬛️'];
exports.tags = square.tags;

exports.draw = function squareFilledDraw(state, previousState, ctx, size) {
  square.draw(state, previousState, ctx, size);

  ctx.fill();
};
