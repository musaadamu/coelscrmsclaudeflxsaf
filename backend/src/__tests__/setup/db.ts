import mongoose from 'mongoose';

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MongoDB URI not found in process.env');
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
