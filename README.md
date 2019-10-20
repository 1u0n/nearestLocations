(this was created as part of a hackaton challenge)

# NEAREST LOCATIONS

Express server that exposes a REST endpoint at `/locations` that calculates the nearest locations :

* **input body**: an array of max. 100 natural-language locations
* **output body**: an array of objects where every input location has a 'nearest' location

## HOW TO USE IT

```
$ npm i
$ npm run lint
$ npm test
$ API_KEY=... PORT=... BUCKETS=... npm start
```

then to test the endpoint:

`curl -iX POST http://localhost:3000/locations -H 'Content-Type: application/json' -d '["The Statue of Liberty","Denver, CO","Hyderabad, Telangana, India", "Chengdu, China", "Dakar, Senegal", "Sol, Madrid"]'`

which will trigger both 'geoBucketing' and 'naive' algorithms concurrently and respond with whatever solution comes first (it'll include in headers which algo it used). You can also select one algorithm:

`http://localhost:3000/locations/NAIVE` or `http://localhost:3000/locations/BUCKETING`

## DEMO

try shooting at http://51.15.228.97:4000/locations , you might get lucky

## DESIGN DECISIONS

* It integrates with mapquest's [batch geocoding api](https://developer.mapquest.com/documentation/open/geocoding-api/batch/post) to retrieve the geocoordinates for input locations. I chose this provider because its free layer allows for batch processing of up to 100 locations.
* It uses an in-memory LRU cache between the server and the geolocation provider, to store already retrieved locations. Given the nature of locations, there's no need to worry about TTL or stale entries.
* Finding each location's nearest:
  * I was tempted to try a k-d tree at the beginning but I came to the conclusion this wasn't the appropiate scenario for it, since we would be re-creating the tree on each call O(nlog2n) and then having to query it n times O(logn)
  * Another solution would be the naive approach, given that we are guaranteed few (50-100) locations on each call, O(n2) wouldn't perform that bad
  * I decided to give geo-bucketing a try, since it can be better than naive approach in several cases (except worse case: many locations clustered together)
  * However I found out on the way that manually creating a bucketed 2d projection of the world is not easy and my current (flat world) implementation fails when locations are near the poles
* The cpu-intensive NN algorithms are executed inside worker threads. There are 2 implementations: 'geoBucketing' and 'naive'. The user can request to run one of them. If not specified, both implementations will run concurrently and the first to finish will be used to answer.
* I didn't have the time to consider many other secondary features: rate limiting, TLS, clusterizing the server (extracting the cache to an external component), endpoint security on bad input, etc...

## WHAT HAPPENS WHEN YOU CALL `/locations` WITH A VALID ARRAY OF LOCATION STRINGS
 
* server checks if any location exists already in cache and retrieves its coordinates
* remaining locations are sent to a geocoding batch api to find their coordinates
* cache is updated with new locations' coordinates
* all coordinates are passed to worker threads to compute the solution
* the method that first finishes is used as response
* the server sends an array of objects `{ location: '..', nearest: '..' }`