import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown() {
  const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
  if (instance) {
    await instance.stop();
  }
}
