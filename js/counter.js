// based on http://zysoft.github.io/jrollingcounter/
function counter_setDigit(id, value, smooth) {
 scroller = document.getElementById(id).getElementsByClassName("num")[0];
 v = value * -(scroller.clientHeight / 11);
 if (smooth) {
  d3.select("#" + id).select(".num").transition().duration(400).style('color', window.primaryColor).style('margin-top', v.toString()+'px');
 } else {
  d3.select("#" + id).select(".num").style('margin-top', v.toString()+'px');
 }
}
function counter_setDigitWithRollover(id, n, smooth) {
 digit = n % 10;
 n = Math.floor(n / 10);
 counter_setDigit(id, digit, smooth);
 if (digit >= 9) {
  n += (digit - 9) ;
 }
 return n;
}
function counter_setNumber(n, all, smooth) { 
 n *= 1000;
 n = counter_setDigitWithRollover("d8", n, smooth);
 n = counter_setDigitWithRollover("d7", n, smooth);
 n = counter_setDigitWithRollover("d6", n, smooth);
 if (all || ((n % 1) > 0)) {
  n = counter_setDigitWithRollover("d5", n, smooth);
  n = counter_setDigitWithRollover("d4", n, smooth);
  n = counter_setDigitWithRollover("d3", n, smooth);
  n = counter_setDigitWithRollover("d2", n, smooth);
  n = counter_setDigitWithRollover("d1", n, smooth);
 }
}
function estimatePirates(all, smooth) {
 now = new Date() / 1000;
 n = window.estimate_intercept + (window.estimate_coefficient * now);
 counter_setNumber(n, all, smooth);
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
