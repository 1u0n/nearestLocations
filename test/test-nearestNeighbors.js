const test = require('tape');
const nearestNeighborsBucketing = require('../src/geoUtil/nearestNeighbors_Bucketing');
const nearestNeighborsNaive = require('../src/geoUtil/nearestNeighbors_Naive');
const { fewLocations, fewLocationsCrossingPoles } = require('./testUtils');

test('BUCKETING - Gets correct nearest locations when there\'s no pole-crossing', function (t) {
  t.plan(1);
  nearestNeighborsBucketing.useGeoBucketing(fewLocations);
  for (const location of fewLocations) {
    if (location.loc === 'loc2') {
      t.equals(location.nearest, 'loc4');
    }
  }
});

test.skip('BUCKETING - Gets correct nearest locations when there is pole-crossing', function (t) {
  t.plan(1);
  nearestNeighborsBucketing.useGeoBucketing(fewLocationsCrossingPoles);
  for (const location of fewLocationsCrossingPoles) {
    if (location.loc === 'loc2') {
      t.equals(location.nearest, 'loc4');
    }
  }
});

test('NAIVE - Gets correct nearest locations when there isn\'t pole-crossing', function (t) {
  t.plan(1);
  nearestNeighborsNaive.useNaive(fewLocations);
  for (const location of fewLocations) {
    if (location.loc === 'loc2') {
      t.equals(location.nearest, 'loc4');
    }
  }
});

test('NAIVE - Gets correct nearest locations when there is pole-crossing', function (t) {
  t.plan(1);
  nearestNeighborsNaive.useNaive(fewLocationsCrossingPoles);
  for (const location of fewLocations) {
    if (location.loc === 'loc2') {
      t.equals(location.nearest, 'loc4');
    }
  }
});
