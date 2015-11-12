'use strict';

var circle = require('./circle.js');

exports.arguments = circle.arguments;
exports.symbols = ['🔴'];
exports.tags = circle.tags;

exports.draw = function circleFilledDraw(state, previousState, ctx) {
  circle.draw(state, previousState, ctx);

  ctx.fill();
};
