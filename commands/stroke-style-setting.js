'use strict';

var strokeStyle = require('./stroke-style.js');

exports.arguments = strokeStyle.arguments;
exports.symbols = strokeStyle.symbols;
exports.tags = ['setting'];

exports.draw = function drawStrokeStyleSetting(state, ctx, color) {
  if (color >= 1) {
    ctx.strokeStyle = strokeStyle.palette[(color - 1) % strokeStyle.palette.length];
  }
};
