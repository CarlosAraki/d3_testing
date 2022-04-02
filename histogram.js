//Histo graphique
var Histogram = d3.histogram()
//import {Histogram} from "@d3/histogram"
// set the dimensions and margins of the graph
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
},
width = 500 - margin.left - margin.right,
height = 250 - margin.top - margin.bottom;
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// X axis: scale and draw:
var x = d3.scaleLinear()
  .domain([-20, 10]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
  .range([0, width]);
var y = d3.scaleLinear()
  .range([height, 0])
  .domain([0, 100] );

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .attr("id", "x-axis");

svg.append("g")
  .call(d3.axisLeft(y))
  .attr("id", "y-axis");


const pathJson = "values.json";
async function importJson(path) {
    const response = await fetch(path);
    const json = await response.json();
    return json;
}

function fn2(inputNumber) {
    return Math.round(Math.random() * inputNumber)
}

function fn1(inputNumber) {
    return function () {
        return Math.round(Math.random() * inputNumber)
    }
}


function showVal(value){
    console.log(value);
    runHist(1,value);
}

//async function to get the data from the json file
(async () => {
    let values = await importJson(pathJson);
    let mu = 1;
    let sigma = 1
    [d3.min(values), d3.median(values), d3.max(values)]
    runHist(mu/10,sigma)

})()

function runHist(mu,sigma){
    let randoms = Float64Array.from({length: 2000}, d3.randomNormal(mu,sigma))
    // randoms = Float64Array.from({length: 2000},fn1(1));
 
     values = randoms;
     bins = Histogram(values)
     // Y axis: scale and draw:
     
     y.domain([0, d3.max(bins, function(d) {
         return d.length;
     })]); // d3.hist has to be called before the Y axis obviously
     d3.select("#y-axis")
         .call(d3.axisLeft(y));
     // append the bar rectangles to the svg element
     svg.selectAll("rect")
         .data(bins)
         .enter()
         .append("rect")
         .attr("x", 1)
         .attr("transform", function(d) {
             return "translate(" + x(d.x0) + "," + y(d.length) + ")";
         })
         .attr("width", function(d) {
             return x(d.x1) - x(d.x0) -1 ;
         })
         .attr("height", function(d) {
             return height - y(d.length);
         })
         .style("fill", "steelblue");
}



