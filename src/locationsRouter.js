const express = require('express');
const LRUCache = require('mnemonist/lru-cache');
const got = require('got');
const router = express.Router();

const API_KEY = process.env.API_KEY;
const errorMessage = 'Oops an error happened, please try again later';

// initialize the cache hinting key & value types
const cache = LRUCache.from({
  'The Statue of Liberty': { lon: -100.445882, lat: 39.78373 },
  'Hyderabad, Telangana, India': { lon: 78.46081, lat: 17.388607 }
}, 2000);

router.post('/', async (req, res, next) => {
  try {
    if (!req.body || !req.body.length || req.body.length > 100) {
      return res.status(400).json({ error: 'Wrong request body' });
    }
    const needGeocoding = [];
    const allCoordinates = [];
    for (const location of req.body) {
      const locationCoordinates = cache.get(location);
      if (!locationCoordinates) {
        needGeocoding.push(location);
      } else {
        allCoordinates.push({ loc: location, lon: locationCoordinates.lon, lat: locationCoordinates.lat });
      }
    }

    console.log(`${allCoordinates.length} from cache, need to geocode ${needGeocoding.length}`);

    if (needGeocoding.length) {
      let geoApiResponse;
      try {
        geoApiResponse = await got.post(`http://open.mapquestapi.com/geocoding/v1/batch?key=${API_KEY}`, {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          json: true,
          body: {
            locations: needGeocoding,
            options: {
              maxResults: 1,
              thumbMaps: false,
              ignoreLatLngInput: false
            }
          },
          timeout: (5000 + needGeocoding.length * 20), // ~6 secs until timeout
          retries: (retry, error) => retry > 2 ? 0 : 500 // max 2 retries
        });
      } catch (e) {
        console.error(`Geocoding request error\n${e}`);
        return res.status(500).json({ error: errorMessage });
      }

      for (const geoResult of geoApiResponse.body.results) {
        let loc = geoResult.providedLocation.street;
        if (!loc) {
          if (geoResult.providedLocation.latLng) {
            loc = `${geoResult.providedLocation.latLng.lng}, ${geoResult.providedLocation.latLng.lat}`;
          } else continue;
        }
        const lon = geoResult.locations[0].latLng.lng;
        const lat = geoResult.locations[0].latLng.lat;
        allCoordinates.push({ loc, lon, lat });
        cache.set(loc, { lon, lat });
      }
    }

    res.json(allCoordinates);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;
