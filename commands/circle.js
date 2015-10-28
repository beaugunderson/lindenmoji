exports.letters = ['C', 'c'];

exports.draw = function circleDraw(state, previousState, ctx) {
  ctx.beginPath();

  ctx.arc(state.x, state.height - (state.y + state.yOffset),
          state.scale * 5, 0, 2 * Math.PI);

  ctx.stroke();
};
