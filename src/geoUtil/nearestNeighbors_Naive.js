const { parentPort, isMainThread } = require('worker_threads');
const geolib = require('geolib');

/**
 * Naive O(n2) approach, for every location calculate distances with all others
 * Acceptable performance because we don't expect large arrays
 * @param {{loc: any, lon: number, lat: number}[]} locations
 */
function useNaive (locations) {
  for (let i = 0; i < locations.length - 1; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const dist = geolib.getDistance(locations[i], locations[j]);
      if (!locations[i].nearest || locations[i].minDist > dist) {
        locations[i].minDist = dist;
        locations[i].nearest = locations[j].loc;
      }
      if (!locations[j].nearest || locations[j].minDist > dist) {
        locations[j].minDist = dist;
        locations[j].nearest = locations[i].loc;
      }
    }
  }
}

if (!isMainThread) {
  parentPort.on('message', (message) => {
    useNaive(message.locations);
    parentPort.postMessage({ resId: message.resId, locations: message.locations, alg: 'NAIVE' });
  });
}

module.exports = { useNaive };
