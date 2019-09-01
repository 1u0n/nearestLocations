const test = require('tape');
const nearestNeighbors = require('../src/geoUtil/nearestNeighbors');
const { fewLocations, fewLocationsCrossingPoles } = require('./testUtils');

test('Gets correct nearest locations when there\'s no pole-crossing', function (t) {
  t.plan(1);
  nearestNeighbors.useGeoBucketing(fewLocations);
  for (const location of fewLocations) {
    if (location.loc === 'loc2') {
      t.equals(location.nearest, 'loc4');
    }
  }
});

test.skip('Gets correct nearest locations when there is pole-crossing', function (t) {
  t.plan(1);
  nearestNeighbors.useGeoBucketing(fewLocationsCrossingPoles);
  for (const location of fewLocationsCrossingPoles) {
    if (location.loc === 'loc2') {
      t.equals(location.nearest, 'loc4');
    }
  }
});
