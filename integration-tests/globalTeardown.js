// integration-tests/globalTeardown.js
module.exports = async () => {
    // 1) Close the client you created in setup
    if (global.__MONGOCLIENT__) {
      await global.__MONGOCLIENT__.close();
    }
    // 2) Stop the in‑memory mongod
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
    }
  };
  