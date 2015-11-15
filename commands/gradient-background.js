'use strict';

var palette = [
  ['#ff0dff', '#e80c7a'],
  ['#94eed5', '#f3fee2'],
  ['#fee69c', '#96f3f8'],
  ['#be5fe3', '#49e2af'],
  ['#f45fba', '#f3d2e5'],
  ['#c9c2c0', '#989ae9'],
  ['#55c0c4', '#b59bd5'],
  ['#2090fb', '#c3b0e8']
];

exports.arguments = ['1-' + palette.length];
exports.symbols = ['🌇'];
exports.tags = ['setting'];

exports.draw = function gradientBackground(state, ctx, number) {
  ctx.save();

  var gradient = ctx.createLinearGradient(0, 0, 0, state.height);

  number--;

  gradient.addColorStop(0, palette[number % palette.length][0]);
  gradient.addColorStop(1, palette[number % palette.length][1]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.restore();
};
