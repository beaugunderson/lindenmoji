'use strict';

var fs = require('fs');
var Canvas = require('canvas');
// TODO:
// var canvasUtilities = require('canvas-utilities');
var consoleFormat = require('./lib/console-format.js');
var pegjs = require('pegjs-import');
var random = require('random-seed');
var system = require('./system.js');
var _ = require('lodash');

var parser = pegjs.buildParser('./parsers/curve.pegjs');

function formatNumber(number) {
  return Math.round(number * 100) / 100;
}

function expandCurve(initial, rules, maxLength) {
  var curve = initial;

  var last;

  function expand(c) {
    if (rules[c.command]) {
      return rules[c.command];
    }

    return c;
  }

  while (curve.length <= maxLength) {
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
    x: 0.0,
    y: 0.0,
    heading: curve.rules.heading || 90.0,
    width: width,
    height: height,
    xOffset: xOffset || 0,
    yOffset: yOffset || 0,
    seed: seed,
    angle: curve.rules.α || curve.rules['📐'] || 60,
    angleChaos: curve.rules['🍥'] || 0,
    distanceChaos: curve.rules['〰️'] || 0,
    scale: scale || 1,
    random: random.create(seed)
  };

  var previousState;

  var bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  };

  if (draw) {
    // clear the background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, state.width, state.height);

    if (settings) {
      _.each(settings, function (args, symbol) {
        if (system.commands[symbol].draw) {
          system.commands[symbol].draw(state, ctx, args[0]);
        }
      });
    }

    // offset as required
    ctx.translate(state.xOffset, 0);

    // TODO: unsure if this requires scaling or not
    ctx.lineWidth = 7.0;

    // initial colour if specific colouring not used
    ctx.strokeStyle = 'rgba(255, 220, 0, 1)';
    ctx.fillStyle = 'rgba(255, 220, 0, 1)';
  }

  function updateBounds() {
    if (state.x < bounds.minX) {
      bounds.minX = state.x;
    } else if (state.x > bounds.maxX) {
      bounds.maxX = state.x;
    }

    if (state.y < bounds.minY) {
      bounds.minY = state.y;
    } else if (state.y > bounds.maxY) {
      bounds.maxY = state.y;
    }
  }

  // catch the initial position
  updateBounds();

  _.each(curve.expanded, function (command) {
    previousState = _.cloneDeep(state);

    if (system.commands[command.command]) {
      // TODO: apply command.args
      if (system.commands[command.command].apply) {
        system.commands[command.command].apply(state, previousState,
          command.args[0]);
      }

      updateBounds();

      if (draw && system.commands[command.command].draw) {
        // TODO: apply command.args
        system.commands[command.command].draw(state, previousState, ctx,
          command.args[0]);
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
  });

  if (draw) {
    ctx.restore();
  }

  return {
    bounds: bounds
  };
}

module.exports = function doCurve(curve, filename, cb) {
  console.log('curve:', consoleFormat(curve));

  var WIDTH = 5000;
  var HEIGHT = 5000;

  var MAX_LENGTH = 100000;

  var canvas = new Canvas(WIDTH, HEIGHT);
  var ctx = canvas.getContext('2d');

  // TODO: use canvasUtilities.prettyCanvas here
  ctx.imageSmoothingEnabled = true;

  ctx.antialias = 'subpixel';

  ctx.filter = 'best';
  ctx.patternQuality = 'best';

  ctx.lineCap = 'round';

  curve = curve.replace(/\s/g, '');

  var parsed = parser.parse(curve);
  var settings = {};

  _.each(parsed.rules, function (rule, symbol) {
    if (_.contains(system.symbolsByTag.setting, symbol)) {
      settings[symbol] = rule;

      delete parsed.rules[symbol];
    }
  });

  // process each command in turn
  parsed.expanded = expandCurve(parsed.initial, parsed.rules, MAX_LENGTH);

  console.log('path length:', parsed.expanded.length);

  // first render, for scale
  var result = render(parsed, settings, MAX_LENGTH, WIDTH, HEIGHT, null, false);

  var renderWidth = result.bounds.maxX - result.bounds.minX;
  var renderHeight = result.bounds.maxY - result.bounds.minY;

  // add padding
  result.bounds.minX -= renderWidth * 0.05;
  result.bounds.minY -= renderHeight * 0.05;

  result.bounds.maxX += renderWidth * 0.05;
  result.bounds.maxY += renderHeight * 0.05;

  renderWidth = Math.round(result.bounds.maxX - result.bounds.minX);
  renderHeight = Math.round(result.bounds.maxY - result.bounds.minY);

  console.log('bounds: %d, %d, %d, %d',
    formatNumber(result.bounds.minX),
    formatNumber(result.bounds.minY),
    formatNumber(result.bounds.maxX),
    formatNumber(result.bounds.maxY));

  var scale;

  console.log('width, height:', renderWidth, renderHeight);

  if (renderWidth / renderHeight > WIDTH / HEIGHT) {
    scale = WIDTH / renderWidth;
  } else {
    scale = HEIGHT / renderHeight;
  }

  console.log('scale:', formatNumber(scale));

  result.bounds.minX *= scale;
  result.bounds.minY *= scale;
  result.bounds.maxX *= scale;
  result.bounds.maxY *= scale;

  renderWidth = Math.round(result.bounds.maxX - result.bounds.minX);
  renderHeight = Math.round(result.bounds.maxY - result.bounds.minY);

  console.log('width, height:', renderWidth, renderHeight);

  var CENTER_X = WIDTH / 2;
  var CENTER_Y = HEIGHT / 2;

  var xOffset = Math.round(CENTER_X - ((renderWidth / 2) + result.bounds.minX));
  var yOffset = Math.round(CENTER_Y - ((renderHeight / 2) + result.bounds.minY));

  console.log('x, y offset:', xOffset, yOffset);

  result = render(parsed, settings, MAX_LENGTH, WIDTH, HEIGHT, ctx, true,
                  xOffset, yOffset, scale);

  canvas.toBuffer(function (err, buffer) {
    if (err) {
      throw err;
    }

    fs.writeFile(filename, buffer, cb);
  });
};
