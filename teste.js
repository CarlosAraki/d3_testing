var paragraphs = document.getElementsByTagName("p");
for (var i = 0; i < paragraphs.length; i++) {
    var paragraph = paragraphs.item(i);
    paragraph.style.setProperty("color", "blue", null);
}

d3.selectAll("p").style("color", function () {
    return "hsl(" + Math.random() * 360 + ",100%,50%)";
});

// d3.selectAll("p").style("color", function(d, i) {
//     return i % 2 ? "#fff" : "#eee";
// });

d3.selectAll("p")
  .data([4, 8, 15, 16, 23, 42])
    .style("font-size", function(d) { return d + "px"; });

d3.select("body")
.selectAll("p")
.data([4, 8, 15, 16, 23, 42])
.enter().append("p")
    .text(function(d) { return "I’m number " + d + "!"; });

// Update…
var p = d3.select("body")
  .selectAll("p")
  .data([4, 8, 15, 16, 23, 41])
    .text(function(d) { return d; });

// Enter…
p.enter().append("p")
    .text(function(d) { return d; });

// Exit…
//p.exit().remove();

d3.select("body").transition()
    .style("background-color", "white");

d3.select("graph").transition()
    .duration(750)
    .delay(function(d, i) { return i * 10; })
    .attr("r", function(d) { return Math.sqrt(d * scale); });
