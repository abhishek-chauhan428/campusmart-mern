const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('ℹ️  No MONGO_URI specified in environment. Starting in-memory MongoDB for local development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        mongoUri = memoryServer.getUri();
        console.log(`✅ In-memory MongoDB started at: ${mongoUri}`);
      } catch (memErr) {
        console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
        throw memErr;
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
