exports.letters = ['r'];

var defaults = exports.defaults = {
  rotationAngle: 10
};

exports.apply = function rotate(state, previousState, angle) {
  var resolved = angle || state.angle || defaults.rotationAngle;

  state.heading += resolved +
    state.random.floatBetween(resolved * state.angleChaos * -1.0,
                              resolved * state.angleChaos);
};
