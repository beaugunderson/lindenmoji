'use strict';

var rainbow = require('../lib/rainbow.js');

exports.arguments = ['1-1'];
exports.symbols = ['🌈'];
exports.tags = ['setting'];

exports.beforeDraw = function (state, previousState, globals) {
  state.strokeColor = rainbow(0, globals.curveLength)(globals.i);
};
