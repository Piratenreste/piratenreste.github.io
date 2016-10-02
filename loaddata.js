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
  enable_draw(0);
  d3.csv("mandate.csv",
   function(d) {
    d.date = parseDate(d.date);
    for (f in d) {
     if (f != "date") {
      d[f] = +d[f];
     }
    }
    return d;
   },
   function(error, data2) {
    window.mandate = data2;
    var index = 0;
    var indexlen = data2.length;
    var mergerlen = window.data.length;
    var lastdata = data2[0];
    var nextdata = data2[1];
    for (var merger = 0; merger < mergerlen; ++merger) {
      if ((index >= indexlen) || (nextdata.date > window.data[merger].date)) {
       for (f in lastdata) {
        if (f != "date") {
         window.data[merger][f] = lastdata[f];
        }
       }
       continue;
      }
      for (f in lastdata) {
       if (f != "date") {
        window.data[merger][f] = nextdata[f];
       }
      }
      index++;
      lastdata = nextdata;
      if ((index + 1) < indexlen) nextdata = data2[index+1];
    }
    console.log('done');
    enable_draw(1);
   }
  );
 }
);

