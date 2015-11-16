'use strict';

var strokeStyle = require('./stroke-style.js');

exports.arguments = strokeStyle.arguments;
exports.symbols = strokeStyle.symbols;
exports.tags = ['setting'];

exports.draw = function drawStrokeStyleSetting(state, ctx, index) {
  if (index >= 1) {
    state.strokeColor = strokeStyle.palette[(index - 1) %
      strokeStyle.palette.length];
  }
};
