var Histogram = d3.histogram()
//import {Histogram} from "@d3/histogram"

const pathJson = "values.json";
async function importJson(path) {
    const response = await fetch(path);
    const json = await response.json();
    return json;
}



//async function to get the data from the json file
(async () => {
    const values = await importJson(pathJson);
    //console.log(json);
    [d3.min(values), d3.median(values), d3.max(values)]
    console.log(d3.min(values), d3.median(values), d3.max(values));
    console.log(Histogram(values));
    chart = Histogram(values, {
        value: d => d.rate,
        label: "Unemployment rate (%) →",
        width: 500,
        height: 500,
        color: "steelblue"
    })
    console.log(chart);

    // var svgContainer = d3
    //     .select("#graph")
    //     .append("svg")
    //     .attr("width", 200)
    //     .attr("height", 200)
    //     .style("border", "1px solid black");


  

    //d3.select("#graph").append(svg)
})()


//importJson(pathJson).then(json => console.log(json));

