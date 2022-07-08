var margin = {
    top: 10,
    right: 20,
    bottom: 20,
    left: 20
},
width = 600 - margin.left - margin.right,
height = 350 - margin.top - margin.bottom;

color = d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(188, 100%, 50%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl)

format = d3.format(",d")



const pathJson = "valuementoria.json";
async function importJson(path) {
    const response = await fetch(path);
    const json = await response.json();
    return json;
}

//async function to get the data from the json file
(async () => {
    let data = await importJson(pathJson);
    pack = data => d3.pack()
        .size([width, height])
        .padding(3)

    (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value))
    chart(data)
})()

function chart(data){
    console.log(data)
    const root = pack(data);
    let focus = root;
    let view;
  
    const svg = d3.select("#graph").append("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .style("display", "block")
        .style("margin", "0 -14px")
        .style("background", color(0))
        .style("cursor", "pointer")
        .on("click", (event) => zoom(event, root));
  
    const node = svg.append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
        .attr("fill", d => d.children ? color(d.depth) : "white")
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));
  
    const label = svg.append("g")
        .style("font", "5px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);
  
    zoomTo([root.x, root.y, root.r * 2]);
  
    function zoomTo(v) {
      const k = width / v[2];
  
      view = v;
  
      label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", d => d.r * k);
    }
  
    function zoom(event, d) {
      const focus0 = focus;
  
      focus = d;
  
      const transition = svg.transition()
          .duration(event.altKey ? 7500 : 750)
          .tween("zoom", d => {
            const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
            return t => zoomTo(i(t));
          });
  
      label
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .transition(transition)
          .style("fill-opacity", d => d.parent === focus ? 1 : 0)
          .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
          .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }
  
    return svg.node();
}