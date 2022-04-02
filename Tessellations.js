import { SVG } from "https://cdn.skypack.dev/@svgdotjs/svg.js";
import {
  createVoronoiTessellation,
  random
} from "https://cdn.skypack.dev/@georgedoescode/generative-utils";

const width = 196;
const height = 196;

const svg = SVG().viewbox(0, 0, width, height);

svg.addTo("body");

const points = [...Array(1024)].map(() => {
  return {
    x: random(0, width),
    y: random(0, height)
  };
});

const tessellation = createVoronoiTessellation({
  // The width of our canvas/drawing space
  width,
  // The height of our canvas/drawing space
  height,
  // The generating points we just created
  points,
  // How much we should "even out" our cell dimensions
  relaxIterations: 6
});
console.log(tessellation)
const debug = true;

tessellation.cells.forEach((cell) => {
  if (debug) {
    svg.polygon(cell.points).fill("none").stroke("#1D1934");
  }
});
