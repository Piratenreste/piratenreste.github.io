// based on http://zysoft.github.io/jrollingcounter/
function setDigit(id, value) {
 scroller = document.getElementById(id).getElementsByClassName("num")[0];
 v = value * -(scroller.clientHeight / 11);
 scroller.setAttribute("style", "margin-top: " + v.toString() + "px");
}
function setDigitWithRollover(id, n) {
 digit = n % 10;
 n = Math.floor(n / 10);
 setDigit(id, digit);
 if (digit >= 9) {
  n += (digit - 9) ;
 }
 return n;
}
function setNumber(n, all) { 
 n *= 1000;
 n = setDigitWithRollover("d8", n);
 n = setDigitWithRollover("d7", n);
 n = setDigitWithRollover("d6", n);
 if (all || ((n % 1) > 0)) {
  n = setDigitWithRollover("d5", n);
  n = setDigitWithRollover("d4", n);
  n = setDigitWithRollover("d3", n);
  n = setDigitWithRollover("d2", n);
  n = setDigitWithRollover("d1", n);
 }
}
function estimatePirates(all) {
 now = new Date() / 1000;
 n = estimate_intercept + (estimate_coefficient * now);
 setNumber(n, all);
}
function translateDatesToDates(dataline) {
 dataline[0] = new Date(dataline[0] + 'T20:00:00');
 return dataline;
}
function rgb2hex(rgb) {
 if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 function hex(x) {
  return ("0" + parseInt(x).toString(16)).slice(-2);
 }
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
history_array_dates = history_array.map(translateDatesToDates);
history_array_dates[0][0] = 'Datum';
current  = history_array[history_array_dates.length - 1][1];
current_timestamp = history_array[history_array_dates.length - 1][0].getTime() / 1000;
previous = history_array[history_array_dates.length - 31][1];
previous_timestamp = history_array[history_array_dates.length - 31][0].getTime() / 1000;

estimate_coefficient_day = (current - previous) / 30;
estimate_coefficient = estimate_coefficient_day / 24 / 60 / 60;
estimate_intercept   = current - (estimate_coefficient * current_timestamp);
estimatePirates(true);
setInterval(estimatePirates,50);
setInterval(function() { estimatePirates(true); }, 2000 );

var last_redraw = 0;
var last_redraw_request = 1;
function resize() {
 last_redraw_request = (new Date()).getTime();
}
window.onresize = resize;

function transposeDataTable(dataTable) {
 //step 1: let us get what the columns would be
 var rows = [];//the row tip becomes the column header and the rest become
 for (var rowIdx=0; rowIdx < dataTable.getNumberOfRows(); rowIdx++) {
  var rowData = [];
  rowData.push(dataTable.getFormattedValue(rowIdx, 0));
  for( var colIdx = 1; colIdx < dataTable.getNumberOfColumns(); colIdx++) {
   rowData.push(dataTable.getValue(rowIdx, colIdx));
  }
  rows.push(rowData);
 }
 var newTB = new google.visualization.DataTable();
 newTB.addColumn('string', dataTable.getColumnLabel(0));
 newTB.addRows(dataTable.getNumberOfColumns()-1);
 var colIdx = 1;
 for(var idx=0; idx < (dataTable.getNumberOfColumns() -1);idx++) {
  var colLabel = dataTable.getColumnLabel(colIdx);
  newTB.setValue(idx, 0, colLabel);
  colIdx++;
 }
 for (var i=0; i<rows.length; i++) {
  var rowData = rows[i];
  newTB.addColumn('number',rowData[0]); //assuming the first one is always a header
  var localRowIdx = 0;
  for(var j=1; j<rowData.length; j++) {
   newTB.setValue(localRowIdx, (i+1), rowData[j]);
   localRowIdx++;
  }
 }
 return newTB;
}

var dashboard;
var controller;
var history_data;
var area_view;
var options_map;
var options_trend;
var chart_map;
var chart_trend;
var initial_redraw = false;
function initChart() {
 history_data = google.visualization.arrayToDataTable(history_array_dates);
 var date_formatter = new google.visualization.DateFormat({ pattern: "dd.MM.yyyy" }); 
 date_formatter.format(history_data, 0);
 history_data_t = transposeDataTable(history_data);
 area_view = new google.visualization.DataView(history_data);
 area_view.setColumns([0, 1]);
 region_view = new google.visualization.DataView(history_data_t);
 region_view.setColumns([0, region_view.getNumberOfColumns()-1]);
 var selectedrows = [];
 for (i = 0; i < history_data_t.getNumberOfRows(); i++) {
  if (history_data_t.getValue(i, 0).charAt(0) == 'D') {
   selectedrows.push(i);
  }
 }
 region_view.setRows(selectedrows);

 dashboard = new google.visualization.Dashboard(document.getElementById('charts'));

 // Create a range slider, passing some options
 controller = new google.visualization.ControlWrapper({
  'controlType': 'DateRangeFilter',
  'containerId': 'control',
  'options': {
   'filterColumnIndex': 0,
   'ui': {
    'label': '',
    'format':  { 'pattern': 'dd.MM.yyyy' },
    'snapToData': true,
    'showRangeValues': false,
    'chartArea': { 'backgroundColor': 'black', 'height': '2em', 'width': '100%' }
   }
  }
 });

 options_map = { region: 'DE', resolution: 'provinces', legend: 'none',
                 colorAxis: {colors: ['#fff', rgb2hex(window.getComputedStyle(document.getElementsByTagName('a')[0]).getPropertyValue('color')) ]},
		 datalessRegionColor: '#666' };
 chart_map = new google.visualization.GeoChart(document.getElementById('map'));

 options_trend = {
  xtitle: 'Mitgliederverlauf',
  colors: [ rgb2hex(window.getComputedStyle(document.getElementsByTagName('a')[0]).getPropertyValue('color')) ],
  rhAxis: { title: 'Datum',  titleTextStyle: { color: '#333' }},
  rvAxis: { minValue:  0 },
  legend: 'none',
 };
 chart_trend = new google.visualization.ChartWrapper({
  chartType: 'AreaChart',
  options: options_trend,
  containerId: 'trend'
 });

 dashboard.bind(controller, chart_trend);
 // Pass in a function definition.
 google.visualization.events.addListener(dashboard, 'ready', function() {
  if (!initial_redraw) {
   initial_redraw = true;
   controller.setState({'lowValue': new Date(previous_timestamp * 1000), 'highValue': new Date(current_timestamp * 1000), 'lowThumbAtMinimum': false});
   controller.draw();
  }
 });
 google.visualization.events.addListener(chart_map, 'select', function() {
  s = chart_map.getSelection();
  console.log(s[0]['row']);
 });
 dashboard.draw(area_view);
 redraw();
 setInterval(redraw, 50);
}

function redraw() {
 if (last_redraw_request > last_redraw) {
  last_redraw = (new Date()).getTime();
  document.getElementById('map').style.marginLeft = (document.getElementById("mapholder").offsetWidth - document.getElementById('map').offsetWidth) / 2 + "px";
  chart_map.draw(region_view, options_map);
  dashboard.draw();
//  controller.draw();
 }
}

google.setOnLoadCallback(initChart);
