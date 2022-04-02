// Generate a string that describes the points of a breadcrumb SVG polygon.
breadcrumbWidth = 75
breadcrumbHeight = 30
width = 640
radius = width / 2
color = d3
    .scaleOrdinal()
    .domain(["home", "product", "search", "account", "other", "end"])
    .range(["#5d85cf", "#7c6561", "#da7847", "#6fb971", "#9e70cf", "#bbbbbb"])

arc = d3
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(1 / radius)
    .padRadius(radius)
    .innerRadius(d => Math.sqrt(d.y0))
    .outerRadius(d => Math.sqrt(d.y1) - 1)

mousearc = d3
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => Math.sqrt(d.y0))
    .outerRadius(radius)


partition = data =>
    d3.partition().size([2 * Math.PI, radius * radius])(
        d3
        .hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value)
    )

function breadcrumbPoints(d, i) {
    const tipWidth = 10;
    const points = [];
    points.push("0,0");
    points.push(`${breadcrumbWidth},0`);
    points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
    points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
    points.push(`0,${breadcrumbHeight}`);
    if (i > 0) {
        // Leftmost breadcrumb; don't include 6th vertex.
        points.push(`${tipWidth},${breadcrumbHeight / 2}`);
    }
    return points.join(" ");
}

function breadcrumb2(sequence, percentage) {
    let svg2 = d3
        .create("svg")
        .attr("viewBox", `0 0 ${breadcrumbWidth * 10} ${breadcrumbHeight}`)
        .style("font", "12px sans-serif")
        .style("margin", "5px");

    let g = svg2
        .selectAll("g")
        .data(sequence)
        .join("g")
        .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

    g.append("polygon")
        .attr("points", bc => breadcrumbPoints())
        .attr("fill", d => color(d.data.name))
        .attr("stroke", "white");

    g.append("text")
        .attr("x", (breadcrumbWidth + 10) / 2)
        .attr("y", 15)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => d.data.name);

    svg2
        .append("text")
        .text(percentage > 0 ? percentage + "%" : "")
        .attr("x", (sequence.length + 0.5) * breadcrumbWidth)
        .attr("y", breadcrumbHeight / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle");

    return svg2.node();
}


function buildHierarchy(csv) {
    // Helper function that transforms the given CSV into a hierarchical format.
    const root = {
        name: "root",
        children: []
    };
    for (let i = 0; i < csv.length; i++) {
        const sequence = csv[i][0];
        const size = +csv[i][1];
        if (isNaN(size)) {
            // e.g. if this is a header row
            continue;
        }
        const parts = sequence.split("-");
        let currentNode = root;
        for (let j = 0; j < parts.length; j++) {
            const children = currentNode["children"];
            const nodeName = parts[j];
            let childNode = null;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                let foundChild = false;
                for (let k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = {
                        name: nodeName,
                        children: []
                    };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = {
                    name: nodeName,
                    value: size
                };
                children.push(childNode);
            }
        }
    }
    return root;
}

console.log(breadcrumb2([],0).outerHTML);
d3.select("#breadcrumb")
.html(breadcrumb2([], 0).outerHTML);


function sunburst(data) {
    const root = partition(data);
    const svg = d3.select("#graph").append("svg");

    // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
    const element = svg.node();
    element.value = {
        sequence: [],
        percentage: 0.0
    };

    const label = svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .style("visibility", "hidden");

    label
        .append("tspan")
        .attr("class", "percentage")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "-0.1em")
        .attr("font-size", "3em")
        .text("");

    label
        .append("tspan")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "1.5em")
        .text("of visits begin with this sequence");

    svg
        .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
        .style("max-width", `${width}px`)
        .style("font", "12px sans-serif");

    const path = svg
        .append("g")
        .selectAll("path")
        .data(
            root.descendants().filter(d => {
                // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
                return d.depth && d.x1 - d.x0 > 0.001;
            })
        )
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc);

    svg
        .append("g")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseleave", () => {
            path.attr("fill-opacity", 1);
            label.style("visibility", "hidden");
            // Update the value of this view
            element.value = {
                sequence: [],
                percentage: 0.0
            };
            d3.select("#breadcrumb").html(breadcrumb2([], 0).outerHTML);

            element.dispatchEvent(new CustomEvent("input"));
        })
        .selectAll("path")
        .data(
            root.descendants().filter(d => {
                // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
                return d.depth && d.x1 - d.x0 > 0.001;
            })
        )
        .join("path")
        .attr("d", mousearc)
        .on("mouseenter", (event, d) => {
            // Get the ancestors of the current segment, minus the root
            const sequence = d
                .ancestors()
                .reverse()
                .slice(1);
            // Highlight the ancestors
            path.attr("fill-opacity", node =>
                sequence.indexOf(node) >= 0 ? 1.0 : 0.3
            );
            const percentage = ((100 * d.value) / root.value).toPrecision(3);
            label
                .style("visibility", null)
                .select(".percentage")
                .text(percentage + "%");
            // Update the value of this view with the currently hovered sequence and percentage
            element.value = {
                sequence,
                percentage
            };

            d3.select("#breadcrumb").html(breadcrumb2(sequence, percentage).outerHTML) 


            element.dispatchEvent(new CustomEvent("input"));
        });
    return element;
}



const pathJson = "datasun.csv";
async function importCsv(path) {
    const response = await fetch(path);
    const text = await response.text();
    return text;
}

//async function to get the data from the json file
(async () => {
    let data = await importCsv(pathJson);
    csv = d3.csvParseRows(data)
    data = buildHierarchy(csv)
    console.log(data);
    let el = sunburst(data);
    console.log(el.value);



})()




function breadcrumbFunc(sequence, percentage) {
    // breadcrumb
    //     .selectAll("g")
    //     .data(sequence)
    //     .join("g")
    //     .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`)
    //     .append("polygon")
    //     .attr("points", breadcrumbPoints)
    //     .attr("fill", d => color(d.data.name))
    //     .attr("stroke", "white")
    //     .text(d => d.data.name);

    breadcrumb
        .selectAll("g")
        .data(sequence)
        .join("g")
        .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`)
        .append("text")
        .attr("x", (breadcrumbWidth + 10) / 2)
        .attr("y", 15)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(d =>
            d.data.name
        );


    // breadcrumb
    //     .text(percentage > 0 ? percentage + "%" : "")
    //     .attr("x", (sequence.length + 0.5) * breadcrumbWidth)
    //     .attr("y", breadcrumbHeight / 2)
    //     .attr("dy", "0.35em")
    //     .attr("text-anchor", "middle");

}