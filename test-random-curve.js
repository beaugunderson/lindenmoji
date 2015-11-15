'use strict';

var render = require('./render-curve.js');
var generateCurve = require('./generate-curve.js');
var uuid = require('uuid');

render(generateCurve(), 5000, 5000, './output/random-' + uuid.v4() + '.png',
  function () {});
