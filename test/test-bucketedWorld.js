const test = require('tape');
const BucketedWorld = require('../src/geoUtil/bucketedWorld');
const { manyLocations, fewLocations } = require('./testUtils');

test('Correctly creates a Map that contains the grid', function (t) {
  let world = new BucketedWorld(fewLocations);
  t.equal(world.world.size, 3);
  world = new BucketedWorld(manyLocations);
  t.equal(world.world.size, 25);
  t.end();
});

test('Iterates in the right direction skipping empty buckets', function (t) {
  const world = new BucketedWorld(manyLocations);
  let lastLon = -181;
  let lastLat = -91;
  let points = world.nextAreaWithPoints();
  let returnedBuckets = 0;
  do {
    for (const loc of points.bucketPoints) {
      if (loc.lat < lastLat && loc.lon < lastLon) {
        t.fail('Should sweep the grid towards right and top');
      }
    }
    lastLon = points.bucketPoints[0].lon;
    lastLat = points.bucketPoints[0].lat;
    points = world.nextAreaWithPoints();
    returnedBuckets++;
  } while (points);
  t.equals(returnedBuckets, world.world.size);
  t.end();
});
