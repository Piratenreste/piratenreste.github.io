import os
import re
import sys
import time

laender = { 'OUTSIDE': 'Ausland', 'BV': 'Bundesverband', 'LV-BB': 'DE-BB', 'LV-BE': 'DE-BE', 'LV-BW': 'DE-BW', 'LV-BY': 'DE-BY', 'LV-HB': 'DE-HB', 'LV-HE': 'DE-HE', 'LV-HH': 'DE-HH', 'LV-LSA': 'DE-ST', 'LV-MV': 'DE-MV', 'LV-NDS': 'DE-NI', 'LV-NRW': 'DE-NW', 'LV-RP': 'DE-RP', 'LV-SH': 'DE-SH', 'LV-SL': 'DE-SL', 'LV-SN': 'DE-SN', 'LV-TH': 'DE-TH' }
landliste = sorted(laender.iterkeys())

dateformat = '%Y-%m-%d'
parsed = {}
for land in landliste:
  parsed['M%s' % land] = []
  parsed['S%s' % land] = []
  parsed['V%s' % land] = []
  with open('git/%s.txt' % land, 'r') as file:
    for line in file:
      m = re.search('^([0-9]{4})([0-9]{2})([0-9]{2})\s(([0-9]+)?\s([0-9]+)?(\s[0-9]+\s([0-9]+))?)?', line)
      if m:
        year, month, day, members, voting, beo = m.group(1), m.group(2), m.group(3), m.group(5), m.group(6), m.group(8)
#       print land, year, month, day, members, voting, beo
	date = '%s-%s-%s' % (year, month, day)
	timestamp = int(time.mktime(time.strptime(date, dateformat)))
	if members is not None:
	  if ((len(parsed['M%s' % land]) == 0) or (parsed['M%s' % land][-1][0] != timestamp)):
            parsed['M%s' % land].append((timestamp, date, int(members)))
	if voting is not None:
	  if ((len(parsed['S%s' % land]) == 0) or (parsed['S%s' % land][-1][0] != timestamp)):
	    parsed['S%s' % land].append((timestamp, date, int(voting)))
	if beo is not None:
	  if ((len(parsed['V%s' % land]) == 0) or (parsed['V%s' % land][-1][0] != timestamp)):
	    parsed['V%s' % land].append((timestamp, date, int(beo)))

l2 = dict(('M%s' % land, 'M%s' % laender[land]) for land in landliste)
l2.update(('S%s' % land, 'S%s' % laender[land]) for land in landliste)
l2.update(('V%s' % land, 'V%s' % laender[land]) for land in landliste)
laender = l2
landliste = sorted(laender.iterkeys())

def find_next(n, start_index):
  index = start_index
  while (index < len(parsed[n])):
    if parsed[n][index][2] is not None:
      return index
    index = index + 1
  return None

state = dict((land, -1) for land in landliste)
next_values = dict((land, find_next(land, 0)) for land in landliste)

def interpolate(y0, y1, x0, x1, x):
  if x1 == x0: return x0
  if y0 is None: return y1
  if y1 is None: return y0
  if y0 == 0: return y0
  y = y0 + ((y1 - y0) * (x - x0) / (x1 - x0))
  return y

with open('estimate.csv', 'w') as e:
  e.write("date,%s\n" % (
      ','.join([laender[land] for land in landliste])
    ))

  while any(v is not None for v in next_values.itervalues()):
    mindate = min([parsed[n][next_values[n]][0] for n in parsed if next_values[n] is not None])
    for n in landliste:
      if next_values[n] is not None and parsed[n][next_values[n]][0] == mindate:
        state[n] = next_values[n]
        next_values[n] = find_next(n, next_values[n] + 1)
        newdate = parsed[n][state[n]][1]
#       print "Update %s %s: %d -> %d" % (newdate, n, parsed[n][state[n]][2], parsed[n][next_values[n]][2])

    interpolated = {}
    for n in landliste:
      if state[n] < 0:
        interpolated[n] = 0
      else:
        if next_values[n] is None:
          interpolated[n] = parsed[n][state[n]][2]
        else:
          interpolated[n] = interpolate(parsed[n][state[n]][2], parsed[n][next_values[n]][2],
	                                parsed[n][state[n]][0], parsed[n][next_values[n]][0], mindate)
#   print "T: %s: %s" % (newdate, str(interpolated))
    line = "%s,%s\n" % (newdate,
      ','.join([str(interpolated[land]) for land in landliste]))
    e.write(line.replace(',0', ','))
