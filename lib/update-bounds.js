'use strict';

module.exports = function (state, points) {
  points.forEach(function (point) {
    if (point[0] < state.minX) {
      state.minX = point[0];
    } else if (point[0] > state.maxX) {
      state.maxX = point[0];
    }

    if (point[1] < state.minY) {
      state.minY = point[1];
    } else if (point[1] > state.maxY) {
      state.maxY = point[1];
    }
  });
};
