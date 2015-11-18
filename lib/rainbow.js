var d3 = require('d3');
var cubehelix = require('d3-plugins-dist/dist/mbostock/cubehelix/cjs/index.js');

d3.interpolateCubehelix = cubehelix.interpolate;

module.exports = function (start, end) {
  return cubehelix.scale()
    .domain([start, (end - start / 2), end])
    .range([
      d3.hsl(-100, 0.75, 0.35),
      d3.hsl(80, 1.50, 0.80),
      d3.hsl(260, 0.75, 0.35)
    ]);
};
