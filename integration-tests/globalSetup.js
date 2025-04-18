// integration-tests/globalSetup.js
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // 1) Start the in‑memory mongod
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // 2) Export URIs so your app picks them up
  process.env.TEST_MONGO_URI = uri;
  process.env.MONGODB_URI    = uri;

  // 3) Save the server handle for teardown
  global.__MONGOD__ = mongo;

  // 4) Eagerly connect your MongoClient and save it
  //    (so you don’t re‑connect later to a stopped server)
  const { clientPromise } = require('../lib/mongo');
  const client = await clientPromise;
  global.__MONGOCLIENT__ = client;
};
