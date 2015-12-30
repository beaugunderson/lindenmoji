'use strict';

var scales = require('../lib/scales.js');

exports.arguments = [`1-${scales.SCALES.length}`];
exports.symbols = ['🌈'];
exports.tags = ['setting'];

exports.beforeDraw = function (state, previousState, globals, ctx, index) {
  state.strokeColor = scales.randomScale(0, globals.curveLength, index)(globals.i);
};
