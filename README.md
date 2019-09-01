# NEAREST LOCATIONS

Express server that exposes a REST endpoint at `/locations` :

* **input**: an array of natural-language locations
* **output**: an array of pairs [A,B] where A is a passed location, and B is its closest location in the same array

## HOW TO USE IT

```
$ npm i
$ npm run lint
$ npm test
$ API_KEY=... PORT=... BUCKETS=... npm start
```

then to test the endpoint:

`curl -X POST http://localhost:3000/locations -H 'Content-Type: application/json' -d '["The Statue of Liberty","Denver, CO","Hyderabad, Telangana, India", "35.08318, -4.001074"]'`

## DESIGN DECISIONS

* It integrates with mapquest's [batch geocoding api](https://developer.mapquest.com/documentation/open/geocoding-api/batch/post) to retrieve the geocoordinates for input locations. I chose this provider because its free layer allows for batch processing of up to 100 locations.
* It uses an in-memory LRU cache between the server and the geolocation provider, to store already retrieved locations. Given the nature of locations, there's no need to worry about TTL or stale entries.
* Finding each location's nearest:
  * I was tempted to try a k-d tree at the beginning but I came to the conclusion this wasn't the appropiate scenario for it, since we would be re-creating the tree on each call O(nlog2n) and then having to query it n times O(logn)
  * Another solution would be the naive approach, given that we are guaranteed few (50-100) locations on each call, O(n2) wouldn't perform that bad
  * I decided to give geo-bucketing a try, since it can be better than naive approach in several cases (except worse case: many locations clustered together)
  * However I found out on the way that creating a bucketed 2d projection of the world is not easy and my current (naive flat world) implementation fails when locations are around or are reached through the poles