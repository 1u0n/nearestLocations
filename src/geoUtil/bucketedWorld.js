const BUCKETS = Number.parseInt(process.env.BUCKETS, 10) || 40;

const DIVISION = 180 / BUCKETS;
const XBOUND = BUCKETS - 1;
const YBOUND = Math.trunc(BUCKETS / 2) - (BUCKETS % 2 ? 0 : 1);

/**
 * Abstraction of a 2d grid over the cartesian coordinates,
 * with dimensions 2*BUCKETS x BUCKETS
 */
class BucketedWorld {
  /**
   * @param {{loc: any, lon: number, lat: number}[]} locations
   */
  constructor (locations) {
    this.world = new Map();
    for (const location of locations) {
      const bucketXY = this.calculateBucketXY(location.lon, location.lat);
      let bucket = this.world.get(`${bucketXY.x},${bucketXY.y}`);
      if (!bucket) {
        bucket = {
          visited: false,
          points: [],
          x: bucketXY.x,
          y: bucketXY.y
        };
      }
      bucket.points.push(location);
      this.world.set(`${bucketXY.x},${bucketXY.y}`, bucket);
    }
    this.nextX = -XBOUND;
    this.nextY = -YBOUND;
  }

  /**
   * @param {number} lon
   * @param {number} lat
   * @returns {{x: number, y: number}} the bucket (x,y) these (lon,lat) coordinates belong to
   */
  calculateBucketXY (lon, lat) {
    return {
      x: Math.trunc(lon / DIVISION),
      y: Math.trunc(lat / DIVISION)
    };
  }

  /**
   * Looks for points on a ring around requested bucket
   * by default ignores ring buckets that have already been visited
   * by default the ring is composed of 8 buckets (n=1: every bucket in direct contact with requested bucket)
   * @param {{x: number, y: number}}
   * @param {boolean=true} ignoreVisited
   * @param {number=1} n
   * @returns {{lon: number, lat:number}[]} the points found around the bucket
   */
  findRingPoints ({ x, y }, ignoreVisited = true, n = 1) {
    const foundPoints = [];
    // 2 horizontal sweeps along bottom and top sides
    for (const i of [y - n, y + n]) {
      for (let j = x - n; j < x + n + 1; j++) {
        const inBounds = this.convertToInBounds(j, i);
        const bucket = this.world.get(`${inBounds.x},${inBounds.y}`);
        if (bucket && (!ignoreVisited || !bucket.visited)) {
          foundPoints.push(...bucket.points);
        }
      }
    }
    // and 2 vertical sweeps along left and right sides
    for (const j of [x - n, x + n]) {
      for (let i = y - n; i < y + n + 1; i++) {
        const inBounds = this.convertToInBounds(j, i);
        const bucket = this.world.get(`${inBounds.x},${inBounds.y}`);
        if (bucket && (!ignoreVisited || !bucket.visited)) {
          foundPoints.push(...bucket.points);
        }
      }
    }

    return foundPoints;
  }

  /**
   * Pass grid coordinates that might be out-bounds, and convert them to in-bounds (eg. 187 -> -173)
   * @param {number} x
   * @param {number} y
   * @returns {{x:number, y:number}} coordinates positioned inside the grid bounds
   */
  convertToInBounds (x, y) {
    if (y < -YBOUND) y = YBOUND + (YBOUND + y + 1);
    else if (y > YBOUND) y = -YBOUND + (y - YBOUND - 1);
    if (x < -XBOUND) x = XBOUND + (XBOUND + x + 1);
    else if (x > XBOUND) x = -XBOUND + (x - XBOUND - 1);
    return { x, y };
  }

  /**
   * Iterates the world grid from bottom left towards right and top, stopping on the first bucket that contains points,
   * and returning that bucket's points, along with points in a ring around it
   * @retuns {{bucketPoints: Array, ringPoints: Array} | null}
   */
  nextAreaWithPoints () {
    let currentBucket;
    do {
      if (this.nextY > YBOUND) return null;
      currentBucket = this.world.get(`${this.nextX},${this.nextY}`);
      this.nextX++;
      if (this.nextX > XBOUND) {
        this.nextX = -XBOUND;
        this.nextY++;
      }
    }
    while (!currentBucket);

    currentBucket.visited = true;
    const bucketPoints = currentBucket.points;
    let ringPoints = this.findRingPoints(currentBucket);
    // case lonely location with no other location around: we need to expand the ring
    for (let i = 2; !ringPoints.length && bucketPoints.length === 1 && i < XBOUND; i++) {
      ringPoints = this.findRingPoints(currentBucket, false, i);
    }

    return { bucketPoints, ringPoints };
  }
}

module.exports = BucketedWorld;
