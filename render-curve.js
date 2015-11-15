'use strict';

var fs = require('fs');
var Canvas = require('canvas');
var canvasUtilities = require('canvas-utilities/lib/utilities.js');
var consoleFormat = require('./lib/console-format.js');
var pegjs = require('pegjs-import');
var random = require('random-seed');
var system = require('./system.js');
var _ = require('lodash');

var parser = pegjs.buildParser('./parsers/curve.pegjs');

var MAX_ITERATIONS = 50000;

function formatNumber(number) {
  return Math.round(number * 100) / 100;
}

function expandCurve(initial, rules, maxLength) {
  var curve = initial;
  var iterations = 0;
  var last;

  function expand(c) {
    if (rules[c.command]) {
      return rules[c.command];
    }

    return c;
  }

  while (curve.length <= maxLength && iterations++ < MAX_ITERATIONS) {
    last = curve;

    curve = _.flatten(curve.map(expand));

    if (last.length === curve.length) {
      console.log('warning: curve is not growing');

      break;
    }
  }

  return last;
}

var seed = _.random(true);

function render(curve, settings, maxLength, width, height, ctx, draw, xOffset,
    yOffset, scale) {
  var stack = [];

  var state = {
    angle: 60,
    angleChaos: 0,
    distance: 10,
    distanceChaos: 0,
    heading: 90.0,
    height: height,
    random: random.create(seed),
    scale: scale || 1,
    seed: seed,
    width: width,
    x: 0.0,
    y: 0.0,
    xOffset: xOffset || 0,
    yOffset: yOffset || 0
  };

  var globals = {
    i: 0,
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  };

  var previousState;

  _.each(settings, function (args, symbol) {
    if (system.settings[symbol].apply) {
      system.settings[symbol].apply(state, args[0]);
    }
  });

  if (draw) {
    // clear the background
    ctx.fillStyle = 'rgb(100, 100, 100)';
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max((7.0 / 5000) * width, 1.0);

    // initial colour if specific colouring not used
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    _.each(settings, function (args, symbol) {
      if (system.settings[symbol].draw) {
        system.settings[symbol].draw(state, ctx, args[0]);
      }
    });

    // offset as required
    ctx.translate(state.xOffset, 0);
  }

  function updateBounds() {
    if (state.x < globals.minX) {
      globals.minX = state.x;
    } else if (state.x > globals.maxX) {
      globals.maxX = state.x;
    }

    if (state.y < globals.minY) {
      globals.minY = state.y;
    } else if (state.y > globals.maxY) {
      globals.maxY = state.y;
    }
  }

  // catch the initial position
  updateBounds();

  _.each(curve.expanded, function (command) {
    previousState = _.cloneDeep(state);

    var c = system.commands[command.command];

    if (c) {
      // TODO: apply command.args
      if (c.apply) {
        c.apply(state, previousState, globals, command.args[0]);
      }

      updateBounds();

      if (draw && c.draw) {
        // TODO: apply command.args
        c.draw(state, previousState, globals, ctx, command.args[0]);
      }
    } else {
      switch (command.command) {
      // TODO: have to store these elsewhere, maybe it's OK that they're here?
      case '[':
        stack.push(_.cloneDeep(state));
        break;

      case ']':
        state = stack.pop();
        break;

      default:
        break;
      }
    }

    if (globals.i % 10000 === 0) {
      process.stdout.write('+');
    } else if (globals.i % 1000 === 0) {
      process.stdout.write('.');
    }

    globals.i++;
  });

  process.stdout.write('\n');

  if (draw) {
    // ctx.strokeStyle = 'red';

    // ctx.beginPath();

    // ctx.moveTo(globals.minX, globals.minY + state.yOffset);
    // ctx.lineTo(globals.minX, globals.maxY + state.yOffset);
    // ctx.lineTo(globals.maxX, globals.maxY + state.yOffset);
    // ctx.lineTo(globals.maxX, globals.minY + state.yOffset);

    // ctx.closePath();

    // ctx.stroke();

    ctx.restore();
  }

  return globals;
}

module.exports = function doCurve(curve, width, height, filename, cb) {
  console.log('curve:', consoleFormat(curve));

  var canvas = new Canvas(width, height);
  var ctx = canvasUtilities.getContext(canvas);

  curve = curve.replace(/\s/g, '');

  var parsed = parser.parse(curve);
  var settings = {};

  _.each(parsed.rules, function (rule, symbol) {
    if (_.contains(system.symbolsByTag.setting, symbol)) {
      settings[symbol] = rule;

      delete parsed.rules[symbol];
    }
  });

  var MAX_LENGTH = 100000;

  // process each command in turn
  parsed.expanded = expandCurve(parsed.initial, parsed.rules, MAX_LENGTH);

  console.log('path length:', parsed.expanded.length);

  // first render, for scale
  var result = render(parsed, settings, MAX_LENGTH, width, height, null, false);

  var renderWidth = result.maxX - result.minX;
  var renderHeight = result.maxY - result.minY;

  // add padding
  result.minX -= renderWidth * 0.05;
  result.minY -= renderHeight * 0.05;

  result.maxX += renderWidth * 0.05;
  result.maxY += renderHeight * 0.05;

  renderWidth = Math.round(result.maxX - result.minX);
  renderHeight = Math.round(result.maxY - result.minY);

  console.log('bounds: %d, %d, %d, %d',
    formatNumber(result.minX),
    formatNumber(result.minY),
    formatNumber(result.maxX),
    formatNumber(result.maxY));

  var scale;

  console.log('width, height:', renderWidth, renderHeight);

  if (renderWidth / renderHeight > width / height) {
    scale = width / renderWidth;
  } else {
    scale = height / renderHeight;
  }

  console.log('scale:', formatNumber(scale));

  result.minX *= scale;
  result.minY *= scale;
  result.maxX *= scale;
  result.maxY *= scale;

  renderWidth = Math.round(result.maxX - result.minX);
  renderHeight = Math.round(result.maxY - result.minY);

  console.log('width, height:', renderWidth, renderHeight);

  var CENTER_X = width / 2;
  var CENTER_Y = height / 2;

  var xOffset = Math.round(CENTER_X - ((renderWidth / 2) + result.minX));
  var yOffset = Math.round(CENTER_Y - ((renderHeight / 2) + result.minY));

  console.log('x, y offset:', xOffset, yOffset);

  result = render(parsed, settings, MAX_LENGTH, width, height, ctx, true,
                  xOffset, yOffset, scale);

  console.log('saving...');

  canvas.toBuffer(function (err, buffer) {
    if (err) {
      return cb(err);
    }

    if (filename) {
      return fs.writeFile(filename, buffer, cb);
    }

    cb(err, buffer);
  });
};
