// set the dimensions and margins of the graph
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
    },
    width = 500 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function (d) {
        return x(d.year);
    })
    .y(function (d) {
        return y(d.population);
    });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function (error, data) {
    console.log(data);
    data.forEach(function (d) {
        d.year = d.year;
        d.population = +d.population;
        x.domain(d3.extent(data, function (d) {
            return d.year;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.population;
        })]);
        svg.append("path").data([data])
            .attr("class", "line").attr("d", valueline);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        svg.append("g")
            .call(d3.axisLeft(y));
    });

    if (error) throw error;
})