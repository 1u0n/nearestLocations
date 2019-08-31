# NEAREST LOCATIONS

Express server that exposes a REST endpoint at `/locations` :

* **input**: an array of natural-language locations
* **output**: an array of pairs [A,B] where A is a passed location, and B is its closest location in the same array

## HOW TO USE IT

`API_KEY=... PORT=... npm start`

then to test the endpoint:

`curl -X POST http://localhost:3000/locations -H 'Content-Type: application/json' -d '["The Statue of Liberty","Denver, CO","Hyderabad, Telangana, India", "35.083180, -4.001074"]'`

## DESIGN DECISIONS

* It integrates with mapquest's [batch geocoding api](https://developer.mapquest.com/documentation/open/geocoding-api/batch/post) to retrieve the geocoordinates for input locations. I chose this provider because its free layer allows for batch processing of up to 100 locations.
* It uses an in-memory LRU cache between the server and the geolocation provider, to store already retrieved locations. Given the nature of locations, there's no need to worry about TTL or stale entries.