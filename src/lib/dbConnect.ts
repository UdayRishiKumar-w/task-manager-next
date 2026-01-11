import mongoose, { connect } from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

/**
 * Use global caching for mongoose connection in dev to avoid
 * creating multiple connections during hot reloads.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis._mongooseCache ?? { conn: null, promise: null };
globalThis._mongooseCache ??= cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  cache.promise ??= connect(MONGODB_URI, {
		dbName: new URL(MONGODB_URI).pathname.replace("/", "") || "tasksdb",
	}).then((m) => {
		return m;
	});

  cache.conn = await cache.promise;
  return cache.conn;
}
