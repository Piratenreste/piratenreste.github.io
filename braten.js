// based on http://zysoft.github.io/jrollingcounter/
function setDigit(id, value, smooth) {
 scroller = document.getElementById(id).getElementsByClassName("num")[0];
 v = value * -(scroller.clientHeight / 11);
 if (smooth) {
  d3.select("#" + id).select(".num").transition().duration(400).style('color', window.primaryColor).style('margin-top', v.toString()+'px');
 } else {
  d3.select("#" + id).select(".num").style('margin-top', v.toString()+'px');
 }
}
function setDigitWithRollover(id, n, smooth) {
 digit = n % 10;
 n = Math.floor(n / 10);
 setDigit(id, digit, smooth);
 if (digit >= 9) {
  n += (digit - 9) ;
 }
 return n;
}
function setNumber(n, all, smooth) { 
 n *= 1000;
 n = setDigitWithRollover("d8", n, smooth);
 n = setDigitWithRollover("d7", n, smooth);
 n = setDigitWithRollover("d6", n, smooth);
 if (all || ((n % 1) > 0)) {
  n = setDigitWithRollover("d5", n, smooth);
  n = setDigitWithRollover("d4", n, smooth);
  n = setDigitWithRollover("d3", n, smooth);
  n = setDigitWithRollover("d2", n, smooth);
  n = setDigitWithRollover("d1", n, smooth);
 }
}
function estimatePirates(all, smooth) {
 now = new Date() / 1000;
 n = window.estimate_intercept + (window.estimate_coefficient * now);
 setNumber(n, all, smooth);
}
function rgb2hex(rgb) {
 if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 function hex(x) {
  return ("0" + parseInt(x).toString(16)).slice(-2);
 }
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function extrapolate_counter(selection, smooth) {
 current  = window.data[window.data.length-1][selection];
 current_timestamp = window.data[window.data.length-1].date.getTime() / 1000 + 20*3600;
 previous = window.data[window.data.length-31][selection];
 previous_timestamp = window.data[window.data.length-31].date.getTime() / 1000 + 20*3600;

 estimate_coefficient_day = (current - previous) / 30;
 window.estimate_coefficient = estimate_coefficient_day / 24 / 60 / 60;
 window.estimate_intercept   = current - (window.estimate_coefficient * current_timestamp);
 estimatePirates(true, smooth);
}
function start_counter() {
 extrapolate_counter(window.plotSelection);
 setInterval(estimatePirates,50);
 setInterval(function() { estimatePirates(true); }, 2000 );
}

var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse;
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d[window.plotSelection]); });

var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d[window.plotSelection]); });

var svg = d3.select("#trend svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath").attr("id", "clip")
   .append("rect").attr("width", width).attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

d3.csv("estimate.csv", type, function(error, data) {
  window.data = data;
  start_counter();
  x.domain(d3.extent(data.map(function(d) { return d.date; })));
  y.domain([0, d3.max(data.map(function(d) { return d[window.plotSelection]; }))]);
  x2.domain(x.domain());
  y2.domain(y.domain());

  focus.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area);

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  focus.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  focus.append("line")
    .attr("class", "x tooltip")
    .style("stroke", "black")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("y1", 0)
    .attr("y2", height);
  focus.append("line")
    .attr("class", "y tooltip")
    .style("stroke", "black")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("x1", width)
    .attr("x2", width);

  focus.append("circle")
    .attr("class", "y tooltip")
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 2)
    .style("display", "none")
    .attr("r", 5);
  focus.append("text")
    .attr("class", "y1 tooltip")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.8)
    .attr("dx", 8)
    .attr("dy", "-.3em");
  focus.append("text")
    .attr("class", "y2 tooltip")
    .attr("dx", 8)
    .attr("dy", "-.3em");
  focus.append("text")
    .attr("class", "y3 tooltip")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.8)
    .attr("dx", 8)
    .attr("dy", "1em");
  focus.append("text")
    .attr("class", "y4 tooltip")
    .attr("dx", 8)
    .attr("dy", "1em");
  focus.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function() { focus.selectAll(".tooltip").style("display", null); })
    .on("mouseout", function() { focus.selectAll(".tooltip").style("display", "none"); })
    .on("mousemove", mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
         i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
         d = x0 - d0.date > d1.date - x0 ? d1 : d0,
        formatDate = d3.time.format("%d.%m.%Y"),
       trf = "translate(" + x(d.date) +
	         "," +
             y(d[window.plotSelection]) + ")";

    if (x(d.date) > 840) {
     if (window.tooltipalign != "end") {
      focus.selectAll("text.tooltip").attr("dx", -8).attr("text-anchor", window.tooltipalign = "end");
     }
    } else {
     if (window.tooltipalign != "start") {
      focus.selectAll("text.tooltip").attr("dx", 8).attr("text-anchor", window.tooltipalign = "start");
     }
    }
    focus.select("circle.y").attr("transform", trf);
    focus.select("text.y1").attr("transform", trf)
      .text(d[window.plotSelection]);
    focus.select("text.y2").attr("transform", trf)
      .text(d[window.plotSelection]);
    focus.select("text.y3").attr("transform", trf)
      .text(formatDate(d.date));
    focus.select("text.y4").attr("transform", trf)
      .text(formatDate(d.date));
    focus.select("line.x").attr("transform", trf)
      .attr("y2", height - y(d[window.plotSelection]));
    focus.select("line.y").attr("transform",
      "translate(" + width * -1 + "," +
        y(d[window.plotSelection]) + ")")
      .attr("x2", width + width);
  }

  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area2);

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  now = new Date();
  yesterday = new Date(now.getTime() - (now.getTime() % (24*60*60*1000)) - 24*60*60*1000);
  then = new Date(yesterday.getTime() - 30*24*60*60*1000)
  brush.extent([then, yesterday]);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);
  brushed();
});

function brushed(smooth) {
 x.domain(brush.empty() ? x2.domain() : brush.extent());
 var dataFiltered = window.data.filter(function(d, i) {
  if ( (d.date >= x.domain()[0]) && (d.date <= x.domain()[1]) ) {
   return d[window.plotSelection];
  }
 })
 extent = d3.extent(dataFiltered.map(function(d) { return d[window.plotSelection]; }));
 if (window.baseline > 0) {
  y.domain([0, extent[1]]);
 } else {
  y.domain([Math.max(0, extent[0] - 10), extent[1] + 10]);
 }
 if (smooth) {
  focus.select(".area").transition().duration(400).attr("d", area).style("fill", window.primaryColor);
  focus.select(".x.axis").transition().duration(400).call(xAxis);
  focus.select(".y.axis").transition().duration(400).call(yAxis);
 } else {
  focus.select(".area").attr("d", area).style("fill", window.primaryColor);
  focus.select(".x.axis").call(xAxis);
  focus.select(".y.axis").call(yAxis);
 }
}

function type(d) {
 d.date = parseDate(d.date);
 for (f in d) {
  if (f != "date") {
   d[f] = +d[f];
  }
 }
 return d;
}

function changePlot(newSelection, newType) {
 if (newType) {
  window.plotTypeSelection=newType;
  newSelection = newType+window.plotSelection.substring(1);
 }
 window.plotSelection = newSelection;
 area.y1(function(d) { return y(d[window.plotSelection]); });
 area2.y1(function(d) { return y2(d[window.plotSelection]); });
 brushed(true);
 y2.domain([0, d3.max(data.map(function(d) { return d[window.plotSelection]; }))]);
 context.select(".area").transition().duration(400).attr("d", area2).style("fill", window.primaryColor);
}
function changeLVSelection(selected) {
 lvs = document.getElementById('ctrlholder').getElementsByTagName('p');
 for (var i = 0; i < lvs.length; i++) {
  if (lvs[i].classList.contains('selected')) {
   lvs[i].classList.remove('selected');
  }
 }
 selected.classList.add('selected');
}

window.plotTypeSelection='M';
window.primaryColor="#F80";
window.baseline=0;
lvs = document.getElementById('ctrlholder').getElementsByTagName('p');
for (var i = 0; i < lvs.length; i++) {
 lvs[i].onclick = function() {
  changeLVSelection(this);
  changePlot(window.plotTypeSelection+this.id);
 }
}

function setToX() {
 d3.selectAll('a').transition().duration(400).style('color', window.primaryColor);
 for (var i = 0; i < document.styleSheets[0].cssRules.length; i++) {
  if (document.styleSheets[0].cssRules[i].selectorText == "#ctrlholder .selected, #ctrlholder .selected:hover") {
   document.styleSheets[0].cssRules[i].style.backgroundColor=window.primaryColor;
  }
  if (document.styleSheets[0].cssRules[i].selectorText == "#ctrlholder :hover") {
   document.styleSheets[0].cssRules[i].style.backgroundColor=window.liteColor;
  }
 }
}
function setToS() {
 window.primaryColor="#808";
 window.liteColor="#C0C";
 changePlot(window.plotSelection, 'S');
 document.getElementById('ctrl-M').classList.remove('selected');
 document.getElementById('ctrl-S').classList.add('selected');
 setToX();
 extrapolate_counter("SBundesverband", true);
 d3.select("#plotcontext").text("zahlende Mitglieder").style("color", window.primaryColor);
}
function setToM() {
 window.primaryColor="#F80";
 window.liteColor="#FC8";
 changePlot(window.plotSelection, 'M');
 document.getElementById('ctrl-S').classList.remove('selected');
 document.getElementById('ctrl-M').classList.add('selected');
 setToX();
 extrapolate_counter("MBundesverband", true);
 d3.select("#plotcontext").text("Mitglieder").style("color", window.primaryColor);
}
function enableBaseline() {
 window.baseline=1;
 document.getElementById('ctrl-D').classList.remove('selected');
 document.getElementById('ctrl-E').classList.add('selected');
 brushed(true);
}
function disableBaseline() {
 window.baseline=0;
 document.getElementById('ctrl-E').classList.remove('selected');
 document.getElementById('ctrl-D').classList.add('selected');
 brushed(true);
}
document.getElementById('ctrl-M').onclick=setToM;
document.getElementById('ctrl-S').onclick=setToS;
document.getElementById('ctrl-D').onclick=disableBaseline;
document.getElementById('ctrl-E').onclick=enableBaseline;
