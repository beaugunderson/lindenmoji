var line = require('./line.js');

exports.letters = ['f'];

exports.defaults = line.defaults;
exports.apply = line.apply;

exports.draw = function lineDraw(state, previousState, ctx) {
  ctx.moveTo(state.x, state.height - (state.y + state.yOffset));
};
