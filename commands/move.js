'use strict';

var line = require('./line.js');

exports.arguments = ['number'];
exports.symbols = ['⤵️', 'M'];
exports.tags = ['movement'];

exports.defaults = line.defaults;
exports.apply = line.apply;

exports.draw = function lineDraw(state, previousState, globals, ctx) {
  ctx.moveTo(state.x, state.height - (state.y + state.yOffset));
};
