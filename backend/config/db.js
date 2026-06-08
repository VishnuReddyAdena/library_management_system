const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isInMemory = false;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found. Starting MongoMemoryServer (In-Memory MongoDB)...');
      isInMemory = true;
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`MongoMemoryServer started at: ${mongoUri}`);
    } else {
      isInMemory = false;
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return mongoUri;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};

const getDbStatus = () => {
  return isInMemory ? 'Ephemeral In-Memory' : 'Persistent MongoDB Atlas/URI';
};

module.exports = { connectDB, disconnectDB, getDbStatus };
