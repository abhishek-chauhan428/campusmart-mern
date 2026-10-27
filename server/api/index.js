const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let dbPromise;

module.exports = async (req, res) => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }

  await dbPromise;
  return app(req, res);
};
