const geolib = require('geolib');
const BucketedWorld = require('./bucketedWorld');

/**
 * Greedy algorithm approach: leverage a world grid to only calculate
 * distances with locations placed in nearby buckets
 * Works best when locations are evenly distributed aorund the globe
 * Worst case is all locations chuncked in a few buckets
 * @param {{loc: any, lon: number, lat: number}[]} locations
 */
function useGeoBucketing (locations) {
  const world = new BucketedWorld(locations);
  let points = world.nextAreaWithPoints();
  while (points) {
    const { bucketPoints, ringPoints } = points;
    // first calculate distances between locations in main bucket
    for (let i = 0; i < bucketPoints.length - 1; i++) {
      for (let j = i + 1; j < bucketPoints.length; j++) {
        const dist = geolib.getDistance(bucketPoints[i], bucketPoints[j]);
        if (!bucketPoints[i].nearest || bucketPoints[i].minDist > dist) {
          bucketPoints[i].minDist = dist;
          bucketPoints[i].nearest = bucketPoints[j].loc;
        }
        if (!bucketPoints[j].nearest || bucketPoints[j].minDist > dist) {
          bucketPoints[j].minDist = dist;
          bucketPoints[j].nearest = bucketPoints[i].loc;
        }
      }
    }
    // then calculate distances between main bucket locations and the ones from the ring
    for (let i = 0; i < bucketPoints.length; i++) {
      for (let j = 0; j < ringPoints.length; j++) {
        const dist = geolib.getDistance(bucketPoints[i], ringPoints[j]);
        if (!bucketPoints[i].nearest || bucketPoints[i].minDist > dist) {
          bucketPoints[i].minDist = dist;
          bucketPoints[i].nearest = ringPoints[j].loc;
        }
        if (!ringPoints[j].nearest || ringPoints[j].minDist > dist) {
          ringPoints[j].minDist = dist;
          ringPoints[j].nearest = bucketPoints[i].loc;
        }
      }
    }
    points = world.nextAreaWithPoints();
  }
}

module.exports = { useGeoBucketing };
