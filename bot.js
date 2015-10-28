'use strict';

var fs = require('fs');
var Canvas = require('canvas');
var parser = require('./parser.js');
var random = require('random-seed');
var requireDirectory = require('require-directory');
var _ = require('lodash');

// function text(curve) {
//   return curve.map(function (command) {
//     return command.command +
//       (command.args ? command.args.join(',') : '');
//   }).join(' ');
// }

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

var commands = {};

requireDirectory(module, './commands/', {
  visit: function (command) {
    command.letters.forEach(function (letter) {
      commands[letter] = command;
    });
  }
});

function render(curve, maxLength, width, height, ctx, draw, xOffset, yOffset, scale) {
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
    // ctx.save();

    // clear the background
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, state.width, state.height);

    // offset as required
    ctx.translate(state.xOffset, 0);

    // initial colour if specific colouring not used
    ctx.strokeStyle = 'rgb(0, 0, 0)';
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

    if (commands[command.command]) {
      // TODO: apply command.args
      if (commands[command.command].apply) {
        commands[command.command].apply(state, previousState, command.args[0]);
      }

      updateBounds();

      if (draw && commands[command.command].draw) {
        // TODO: apply command.args
        commands[command.command].draw(state, previousState, ctx, command.args[0]);
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

      case 'm':
        if (draw) {
          if (command.args.length) {
            ctx.strokeStyle = 'hsl(0, 100%, ' + (command.args * 10) + '%)';
          } else {
            ctx.strokeStyle = 'hsl(0, 100%, 50%)';
          }
        }

        break;

      default:
        break;
      }
    }
  });

  if (draw) {
    // draw the debug outline
    // ctx.strokeStyle = 'red';

    // ctx.beginPath();

    // ctx.moveTo(bounds.minX, bounds.minY + state.yOffset);
    // ctx.lineTo(bounds.minX, bounds.maxY + state.yOffset);
    // ctx.lineTo(bounds.maxX, bounds.maxY + state.yOffset);
    // ctx.lineTo(bounds.maxX, bounds.minY + state.yOffset);

    // ctx.closePath();

    // ctx.stroke();

    // finalise rendering
    ctx.restore();
  }

  return {
    bounds: bounds
  };
}

// var curve = 'A;' +
//   'A=→5 A →16 c [B R15];' +
//   'B=R32.2 c [A →1 R2] →2,3 R3 →1.5 C;' +
//   'C=→5 B A';

// var curve = 'FX; X=X+YF+; Y=-FX-Y; α=90';
// var curve = 'F-F-F-F; F=F-F+F+FF-F-F+F; α=90';

var curve = 'A;' +
  'A=m2 →5 A →16 c [B R15];' +
  'B=m5 R32.2 →10 [c [A →1 R2] →2,3] [R3 →1.5 C];' +
  'C=m8 →5 B [A];' +
  '〰️=0.8; 🍥=0.6';

// var curve = 'X X X X; X=F C R90;';

// var curve = 'X; X=F-[[X]+X]+F[+FX]-X; F=FF; α=25';

// var curve = 'X; X=F B C B C B R15 F X; B=R10 [R25 F]; C=R5 [R-25 F]';

// var curve = 'X Y X Y Z Y X Y X; X=F F + Y + F X - F R23.3; Y=c F + F R13.3; Z=c F c F c F c';

// var curve = 'F; F=F + + B F - F + F; B=+ F [F - F [- F + F]]';

// var curve = 'F; F=m1 F[+ + F m7[- F]]F[-FF[F]]; 📐=12; 〰️=0.8; 🍥=0.6';

console.log('curve', curve);

var WIDTH = 5000;
var HEIGHT = 5000;

var MAX_LENGTH = 250000;

var canvas = new Canvas(WIDTH, HEIGHT);
var ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = true;

ctx.antialias = 'subpixel';

ctx.filter = 'best';
ctx.patternQuality = 'best';

ctx.lineCap = 'round';

var parsed = parser.parse(curve.replace(/\s/g, ''));

// process each command in turn
parsed.expanded = expandCurve(parsed.initial, parsed.rules, MAX_LENGTH);

console.log('path length', parsed.expanded.length);

// first render, for scale
var result = render(parsed, MAX_LENGTH, WIDTH, HEIGHT, null, false);

var renderWidth = result.bounds.maxX - result.bounds.minX;
var renderHeight = result.bounds.maxY - result.bounds.minY;

// add padding
result.bounds.minX -= renderWidth * 0.1;
result.bounds.minY -= renderHeight * 0.1;

result.bounds.maxX += renderWidth * 0.1;
result.bounds.maxY += renderHeight * 0.1;

renderWidth = result.bounds.maxX - result.bounds.minX;
renderHeight = result.bounds.maxY - result.bounds.minY;

console.log('result', result);

var scale;

console.log('delta x, y', renderWidth, renderHeight);

if (renderWidth / renderHeight > WIDTH / HEIGHT) {
  scale = WIDTH / renderWidth;
} else {
  scale = HEIGHT / renderHeight;
}

console.log('scale', scale);

result.bounds.minX *= scale;
result.bounds.minY *= scale;
result.bounds.maxX *= scale;
result.bounds.maxY *= scale;

renderWidth = result.bounds.maxX - result.bounds.minX;
renderHeight = result.bounds.maxY - result.bounds.minY;

console.log('delta x, y', renderWidth, renderHeight);

var CENTER_X = WIDTH / 2;
var CENTER_Y = HEIGHT / 2;

var xOffset = CENTER_X - ((renderWidth / 2) + result.bounds.minX);
var yOffset = CENTER_Y - ((renderHeight / 2) + result.bounds.minY);

console.log('x, y offset', xOffset, yOffset);

result = render(parsed, MAX_LENGTH, WIDTH, HEIGHT, ctx, true, xOffset, yOffset, scale);

canvas.toBuffer(function (err, buffer) {
  if (err) {
    throw err;
  }

  fs.writeFile('./out.png', buffer, function (writeError) {
    console.log('done', writeError);
  });
});
