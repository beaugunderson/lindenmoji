'use strict';

exports.arguments = ['number'];
exports.symbols = ['➡️', 'F', '→'];
exports.tags = ['drawing', 'movement'];

// TODO: DRY this
function radians(angle) {
  return Math.PI * angle / 180;
}

var defaults = exports.defaults = {
  distance: 10
};

exports.apply = function lineMove(state, previousState, globals, distance) {
  var resolved = (distance || state.distance || defaults.distance) * state.scale;

  resolved += state.random.floatBetween(resolved * state.distanceChaos * -1.0,
                                        resolved * state.distanceChaos);

  var rad = radians(state.heading);

  state.x += resolved * Math.cos(rad);
  state.y += resolved * Math.sin(rad);
};

exports.draw = function lineDraw(state, previousState, globals, ctx) {
  ctx.beginPath();

  ctx.moveTo(previousState.x, state.height - (previousState.y + state.yOffset));
  ctx.lineTo(state.x, state.height - (state.y + state.yOffset));

  ctx.stroke();
};
