'use strict';

var doCurve = require('./bot.js');
var generateCurve = require('./generate-curve.js');
var uuid = require('uuid');

doCurve(generateCurve(), './output/random-' + uuid.v4() + '.png', function () {});
