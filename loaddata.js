d3.csv("estimate.csv",
 function(d) {
  d.date = parseDate(d.date);
  for (f in d) {
   if (f != "date") {
    d[f] = +d[f];
   }
  }
  return d;
 },
 function(error, data) {
  window.data = data;
  start_counter();
  enable_draw();
 }
);
