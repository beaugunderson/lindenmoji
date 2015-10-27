'use strict';

var fs = require('fs');
var Canvas = require('canvas');
var parser = require('./parser.js');
var random = require('random-seed');
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
      console.log('error: curve is not growing');
      process.exit(1);
    }
  }

  return last;
}

function radians(angle) {
  return Math.PI * angle / 180;
}

var seed = _.random();

function render(curve, maxLength, width, height, ctx, draw, xOffset, yOffset, distance, modifier) {
  var seededRandom = random.create(seed);

  var stack = [];

  var heading = curve.rules.heading || 90.0;

  var angle = curve.rules.α || curve.rules['📐'] || 60;
  var angleChaos = curve.rules['🍥'] || 0;

  // TODO: specify via rule
  distance = distance || 10;
  var distanceChaos = curve.rules['〰️'] || 0;

  modifier = modifier || 1;

  xOffset = xOffset || 0;
  yOffset = yOffset || 0;

  console.log('render params', angle, distance, xOffset, yOffset, modifier);

  maxLength = maxLength || seededRandom.intBetween(5000, 500000);

  var minx = Infinity;
  var miny = Infinity;
  var maxx = -Infinity;
  var maxy = -Infinity;

  var lastX;
  var lastY;

  if (draw) {
    // clear the background
    // ctx.save();

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, width, height);

    // offset as required
    ctx.translate(xOffset, 0);

    // initial colour if specific colouring not used
    ctx.strokeStyle = 'rgb(0, 0, 0)';
  }

  // start at grid 0,0 facing north with no colour index
  var pos = {x: 0.0, y: 0.0, heading: heading};

  function updateBounds() {
    if (pos.x < minx) {
      minx = pos.x;
    } else if (pos.x > maxx) {
      maxx = pos.x;
    }

    if (pos.y < miny) {
      miny = pos.y;
    } else if (pos.y > maxy) {
      maxy = pos.y;
    }
  }

  // catch the initial position
  updateBounds();

  function updateLast() {
    lastX = pos.x;
    lastY = pos.y;
  }

  function move(dist) {
    dist = dist || distance;
    dist += seededRandom.floatBetween(dist * distanceChaos * -1.0,
                                      dist * distanceChaos);

    // move the turtle
    var rad = radians(pos.heading);

    pos.x += dist * Math.cos(rad);
    pos.y += dist * Math.sin(rad);

    updateBounds();
  }

  function drawPath() {
    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(lastX, height - (lastY + yOffset));
    ctx.lineTo(pos.x, height - (pos.y + yOffset));

    // unneeded, draws the reverse of the path and makes lineCap not work
    // ctx.closePath();

    ctx.stroke();
  }

  function drawCircle() {
    ctx.arc(pos.x, height - (pos.y + yOffset), distance / 3, 0, 2 * Math.PI,
            false);

    ctx.stroke();
  }

  function movePath() {
    ctx.moveTo(pos.x, height - (pos.y + yOffset));
  }

  var step;

  _.each(curve.expanded, function (command) {
    switch (command.command) {
    case '+':
      pos.heading += angle + seededRandom.floatBetween(angle * angleChaos * -1.0,
                                                       angle * angleChaos);
      break;

    case '-':
      pos.heading -= angle + seededRandom.floatBetween(angle * angleChaos * -1.0,
                                                       angle * angleChaos);
      break;

    case '[':
      stack.push(_.cloneDeep(pos));
      break;

    case ']':
      pos = stack.pop();
      break;

    case 'F':
    case '→':
      updateLast();

      step = distance;

      if (command.args.length) {
        step = command.args[0] * modifier;
      }

      move(step);

      if (draw) {
        drawPath();
      }

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

    case 'R':
      step = angle;

      if (command.args.length) {
        step = command.args[0];
      }

      pos.heading += step + seededRandom.floatBetween(step * angleChaos * -1.0,
                                                      step * angleChaos);

      break;

    case 'c':
      updateLast();
      move();

      if (draw) {
        drawCircle();
      }

      break;

    case 'f':
      updateLast();
      move();

      if (draw) {
        movePath();
      }

      break;

    default:
      break;
    }
  });

  // finalise rendering
  if (draw) {
    ctx.strokeStyle = 'red';

    ctx.beginPath();

    ctx.moveTo(minx, miny + yOffset);
    ctx.lineTo(minx, maxy + yOffset);
    ctx.lineTo(maxx, maxy + yOffset);
    ctx.lineTo(maxx, miny + yOffset);

    ctx.closePath();

    ctx.stroke();

    ctx.restore();
  }

  return {
    minx: minx,
    miny: miny,
    maxx: maxx,
    maxy: maxy
  };
}

// var curve = 'A;' +
//   'A=→5 A →16 c [B R15];' +
//   'B=R32.2 c [A →1 R2] →2,3 R3 →1.5 C;' +
//   'C=→5 B A';

// var curve = 'FX; X=X+YF+; Y=-FX-Y; α=90';
// var curve = 'F-F-F-F; F=F-F+F+FF-F-F+F; α=90';

// var curve = 'A;' +
//   'A=m2 →5 A →16 c [B R15];' +
//   'B=m5 R32.2 →10 [c [A →1 R2] →2,3] [R3 →1.5 C];' +
//   'C=m8 →5 B [A]';

// var curve = 'X; X=F-[[X]+X]+F[+FX]-X; F=FF; α=25';

// var curve = 'X; X=F B C B C B R15 F X; B=R10 [R25 F]; C=R5 [R-25 F]';

// var curve = 'X Y X Y Z Y X Y X; X=F F + Y + F X - F R23.3; Y=c F + F R13.3; Z=c F c F c F c';

// var curve = 'F; F=F + + B F - F + F; B=+ F [F - F [- F + F]]';

var curve = 'F; F=F[+ + F[- F]]F[-FF[F]]; 📐=12; 〰️=0.8; 🍥=0.6';

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
var dim = render(parsed, MAX_LENGTH, WIDTH, HEIGHT, null, false);

var deltaX = dim.maxx - dim.minx;
var deltaY = dim.maxy - dim.miny;

// add padding
dim.minx -= deltaX * 0.1;
dim.miny -= deltaY * 0.1;

dim.maxx += deltaX * 0.1;
dim.maxy += deltaY * 0.1;

deltaX = dim.maxx - dim.minx;
deltaY = dim.maxy - dim.miny;

console.log('dim', dim);

var oldDistance = 10.0;
var scale;

console.log('delta x, y', deltaX, deltaY);

if (deltaX / deltaY > WIDTH / HEIGHT) {
  scale = WIDTH / deltaX;
} else {
  scale = HEIGHT / deltaY;
}

var newDistance = scale * oldDistance;

console.log('scale', scale);
console.log('old, new distance', oldDistance, newDistance);

dim.minx *= scale;
dim.miny *= scale;
dim.maxx *= scale;
dim.maxy *= scale;

deltaX = dim.maxx - dim.minx;
deltaY = dim.maxy - dim.miny;

console.log('delta x, y', deltaX, deltaY);

// second render, for translation
dim = render(parsed, MAX_LENGTH, WIDTH, HEIGHT, null, false, 0, 0, newDistance, scale);

console.log('dim2', dim);

deltaX = dim.maxx - dim.minx;
deltaY = dim.maxy - dim.miny;

console.log('delta x, y', deltaX, deltaY);

var CENTER_X = WIDTH / 2;
var CENTER_Y = HEIGHT / 2;

var xoffset = CENTER_X - ((deltaX / 2) + dim.minx);
var yoffset = CENTER_Y - ((deltaY / 2) + dim.miny);

console.log('x, y offset', xoffset, yoffset);

dim = render(parsed, MAX_LENGTH, WIDTH, HEIGHT, ctx, true, xoffset, yoffset, newDistance, scale);

canvas.toBuffer(function (err, buffer) {
  if (err) {
    throw err;
  }

  fs.writeFile('./out.png', buffer, function (writeError) {
    console.log('done', writeError);
  });
});
