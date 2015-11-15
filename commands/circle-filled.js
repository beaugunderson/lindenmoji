'use strict';

var circle = require('./circle.js');

exports.arguments = circle.arguments;
exports.symbols = ['🔴'];
exports.tags = circle.tags;

exports.apply = circle.apply;

exports.draw = function circleFilledDraw(state, previousState, globals, ctx, size) {
  circle.draw.apply(this, arguments);

  ctx.fill();
};
