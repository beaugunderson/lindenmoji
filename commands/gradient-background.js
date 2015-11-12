'use strict';

var palette = [
  ['#ff0dff', '#e80c7a']
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
