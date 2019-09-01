const {
  Worker, isMainThread
} = require('worker_threads');

if (isMainThread) {
  const bucketingWorker = new Worker(`${__dirname}/geoUtil/nearestNeighbors_Bucketing.js`);
  const naiveWorker = new Worker(`${__dirname}/geoUtil/nearestNeighbors_Naive.js`);

  module.exports = { naive: naiveWorker, bucketing: bucketingWorker };
}
