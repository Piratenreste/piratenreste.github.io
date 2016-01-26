var parseDate = d3.time.format("%Y-%m-%d").parse;
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 430, right: 10, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

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

var svg = d3.select("#content svg");

svg.append("defs").append("clipPath").attr("id", "clip")
   .append("rect").attr("width", width).attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


function enable_draw() {
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
         i = bisectDate(data, x0, 1);
	if (i >= data.length) {
		i = data.length - 1;
	}
	var d0 = data[i - 1],
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
}

function brushed(smooth) {
 x.domain(brush.empty() ? x2.domain() : brush.extent());
 var dataFiltered = window.data.filter(function(d, i) {
  if ( (d.date >= x.domain()[0]) && (d.date <= x.domain()[1]) ) {
   return d[window.plotSelection];
  }
 })
 extent = d3.extent(dataFiltered.map(function(d) { return d[window.plotSelection]; }));
 if (window.baseline > 0) {
  if (window.baseline_override > 0) {
   y.domain([0, window.baseline_override]);
  } else {
   y.domain([0, extent[1]]);
  }
 } else {
  y.domain([Math.max(0, extent[0] - 10), extent[1] + 10]);
 }
 if (smooth) {
  focus.select(".area").transition().duration(400).attr("d", area).style("fill", window.primaryColor);
  context.select(".area").transition().duration(400).attr("d", area2).style("fill", window.primaryColor);
  focus.select(".x.axis").transition().duration(400).call(xAxis);
  focus.select(".y.axis").transition().duration(400).call(yAxis);
 } else {
  focus.select(".area").attr("d", area).style("fill", window.primaryColor);
  context.select(".area").attr("d", area2).style("fill", window.primaryColor);
  focus.select(".x.axis").call(xAxis);
  focus.select(".y.axis").call(yAxis);
 }
}

function updatePlot() {
 area.y1(function(d) { return y(d[window.plotSelection]); });
 area2.y1(function(d) { return y2(d[window.plotSelection]); });
 y2.domain([0, d3.max(data.map(function(d) { return d[window.plotSelection]; }))]);
 brushed(true);
}

window.primaryColor="#F80";
window.secondaryColor="#FC8";
window.baseline=0;
window.baseline_override=0;
function updatecolors() {
 for (var s = 0; s < document.styleSheets.length; s++) {
  for (var i = 0; i < document.styleSheets[s].cssRules.length; i++) {
   var rule = document.styleSheets[s].cssRules[i];
   if ("selectorText" in rule) {
    if (rule.selectorText.indexOf("#activeforeground") > -1) {
     rule.style.color=window.primaryColor;
    }
	if (rule.selectorText.indexOf("#activebackground") > -1) {
     rule.style.backgroundColor=window.primaryColor;
    } else if (rule.selectorText.indexOf("#activelightbackground") > -1) {
     rule.style.backgroundColor=window.secondaryColor;
    }
   }
  }
 }
}

(function () {

    "use strict";

    document.addEventListener("deviceready", function () {
        FastClick.attach(document.body);
        StatusBar.overlaysWebView(false);
    }, false);


    // Show/hide menu toggle
    $('#btn-menu').click(function () {
        if ($('#container').hasClass('offset')) {
            $('#container').removeClass('offset');
        } else {
            $('#container').addClass('offset');
        }
        return false;
    });

    // Basic view routing
    $(window).on('hashchange', route);

	var defaultsetting = Array('#', 'Bundesverband', 'A', 'R');
	
	function update(selection, newvalue) {
		switch(selection) {
			case 1:
//				alert(selection + " => " + newvalue);
				break;
			case 2:
				switch(newvalue) {
					case 'Z':
						window.primaryColor="#808";
						window.secondaryColor="#C8C";
						window.baseline_override=0;
						updatecolors();
						break;
					case 'A':
						window.primaryColor="#F80";
						window.secondaryColor="#FC8";
						window.baseline_override=0;
						updatecolors();
						break;
					case 'V':
						window.primaryColor="#360";
						window.secondaryColor="#9C8";
						window.baseline_override=0;
						updatecolors();
						break;
					case 'Q':
						window.primaryColor="#4682B4";
						window.secondaryColor="#8CF";
						window.baseline_override=100;
						updatecolors();
						break;
				}
				break;
			case 3:
				switch(newvalue) {
					case 'R':
						window.baseline=0;
						if (window.data != undefined) {
							brushed(true);
						}
						break;
					case 'A':
						window.baseline=1;
						if (window.data != undefined) {
							brushed(true);
						}
						break;
				}
				break;
		}
	}
	
	var buttons = document.getElementById('left-nav').getElementsByTagName('a');
	var buttonsvalue = Array();
	var buttonssetmodify = Array();
	for (var i = 0; i < buttons.length; i++) {
		var elemid = buttons[i].id.split(":");
		if (elemid.length == 2) {
			buttonsvalue[i] = elemid[0];
			buttonssetmodify[i] = parseInt(elemid[1]);
		} else {
			buttonsvalue[i] = "";
			buttonssetmodify[i] = 0;
		}
	}

    function route() {
		// Identify current selection
		var setting = window.location.hash.split('/');
		while (setting.length < defaultsetting.length) {
			setting.push("");
		}
		for (var i = 0; i < defaultsetting.length; i++) {
			if (setting[i] == "") {
				setting[i] = defaultsetting[i];
			}
		}

		// Update selections and links
		for (var i = 0; i < buttons.length; i++) {
			if (buttonssetmodify[i] > 0) {
				if (setting[buttonssetmodify[i]] == buttonsvalue[i]) {
					if (!buttons[i].classList.contains('selected')) {
						buttons[i].classList.add('selected');
					}
				} else {
					if (buttons[i].classList.contains('selected')) {
						buttons[i].classList.remove('selected');
					}
				}
				buttons[i].href = setting.slice(0,buttonssetmodify[i]).join('/')
				 + '/' + buttonsvalue[i] + '/' + setting.slice(1 + buttonssetmodify[i]).join('/');
			}
		}

		var lv = document.getElementById(setting[1] + ":" + 1);
		var lvname = "tag" in lv.attributes ? lv.getAttribute("tag") : lv.textContent;
		var status = document.getElementById(setting[2] + ":" + 2);
		var statusname = "tag" in status.attributes ? status.getAttribute("tag") : "";
		$("#pagetitle").html("Wieviele <span>" + statusname + " Mitglieder</span> hat die <span>Piratenpartei " + lvname + "</span>?");

		for (var i = 0; i < defaultsetting.length; i++) {
			if ((window.lastsetting == undefined) ||
				(window.lastsetting[i] != setting[i])) {
				update(i, setting[i]);
			}
		}
		switch (setting[2]) {
			case 'A': window.plotSelection = "M" + setting[1]; break;
			case 'Z': window.plotSelection = "S" + setting[1]; break;
			default: window.plotSelection = setting[2] + setting[1]; break;
		}
		if (window.data != undefined) {
			if (window.lastplotSelection != window.plotSelection) {
				extrapolate_counter(window.plotSelection, true);
			}
			if (window.lastsetting != setting) {
				updatePlot();
			}
		}
		window.lastsetting = setting.slice();
		window.lastplotSelection = window.plotSelection;
	}

	route();

}());
