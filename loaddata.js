d3.csv("estimate.csv",
 function(d) {
  d.date = parseDate(d.date);
  for (f in d) {
   if (f != "date") {
    d[f] = +d[f];
    if (f.substring(0,1) == 'M') {
     if (d[f] > 0) {
      d['Q' + f.substring(1)] = Math.round(10000 * d['S' + f.substring(1)] / d[f]) / 100;
     } else {
      d['Q' + f.substring(1)] = 0;
     }
    }
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
