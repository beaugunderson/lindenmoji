'use strict';

var async = require('async');
var doCurve = require('./bot.js');

var curves = [
  // 'A;' +
  //   'A=→5 A →16 c [B r15];' +
    // 'B=r32.2 c [A →1 r2] →2,3 r3 →1.5 O;' +
    // 'O=→5 B A',

  // 'Fx; x=x+yF+; y=-Fx-y; α=90',

  // 'F-F-F-F; F=F-F+F+FF-F-F+F; α=90',

  // 'A;' +
    // 'A=m2 →5 A →16 c [B r15];' +
    // 'B=m5 r32.2 →10 [c [A →1 r2] →2,3] [r3 →1.5 O];' +
    // 'O=m8 →5 B [A];' +
    // '〰️=0.8; 🍥=0.6',

  // 'x x x x; x=F O r90;',

  // 'x; x=F-[[x]+x]+F[+Fx]-x; F=FF; α=25',

  // 'x; x=F B O B O B r15 F x; B=r10 [r25 F]; O=r5 [r-25 F]',

  // 'x y x y Z y x y x; x=F F + y + F x - F r23.3;' +
    // 'y=c F + F r13.3; Z=c F c F c F c',

  // 'F; F=F + + B F - F + F; B=+ F [F - F [- F + F]]',

  // 'F; F=m1 F[+ + F m7[- F]]F[-FF[F]]; 📐=12; 〰️=0.8; 🍥=0.6',

  'l; l=+rF-lFl-Fr+; r=-lF+rFr+Fl-; 📐=90',

  'l; l=+rF-lFl-Fr+; r=-lF+rFr+Fl-; 📐=90; 🍥=0.01',

  'yF; x=yF+xF+y; y=xF-yF-x; 📐=60',

  'Fx; x=x+yF++yF-Fx--FxFx-yF+; y=-Fx+yFyF++yF+Fx--Fx-y; 📐=60',

  'Fx; x=x+yF++yF-Fx--FxFx-yF+; y=-Fx+yFyF++yF+Fx--Fx-y; 📐=60; 🍥=0.01',

  'Fx; x=x+yF++yF-Fx--FxFx-yF+; y=-Fx+yFyF++yF+Fx--Fx-y; 📐=60; 〰️=0.01',

  'Fx; x=x+yF++yF-Fx--FxFx-yF+; y=-Fx+yFyF++yF+Fx--Fx-y; 📐=60; 🍥=0.01; 〰️=0.01',

  'F+xF+F+xF; x=xF-F+F-xF+F+xF-F+F-x; 📐=90',

  'FxF--FF--FF; F=FF; x=--FxF++FxF++FxF--; 📐=60'
];

var count = 0;

async.eachSeries(curves, function (curve, eachSeriesCb) {
  doCurve(curve, './output/out-' + (++count) + '.png', function (err) {
    console.log();

    eachSeriesCb(err);
  });
}, function (err) {
  if (err) {
    console.log('err', err);
  }
});
