import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

if (!DB_NAME) {
  throw new Error("Please define the DB_NAME environment variable in .env.local");
}

// Global cache prevents duplicate connections during development hot reloads.
const globalWithMongo = global;
const cached = globalWithMongo.mongoCache || { client: null, promise: null };
globalWithMongo.mongoCache = cached;

async function dbConnect() {
  if (cached.client) {
    return cached.client.db(DB_NAME);
  }

  if (!cached.promise) {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    cached.promise = client.connect();
  }

  try {
    cached.client = await cached.promise;
  } catch (e) {
    console.error("[mongodb] connection failed", e);
    cached.promise = null;
    throw e;
  }

  return cached.client.db(DB_NAME);
}

function serializeVideo(video) {
  return {
    ...video,
    _id: video._id.toString(),
  };
}

export function serializeSubject(subject) {
  return {
    ...subject,
    _id: subject._id.toString(),
    videos: (subject.videos || []).map(serializeVideo),
    playlists: (subject.playlists || []).map((playlist) => ({
      ...playlist,
      _id: playlist._id.toString(),
      videos: (playlist.videos || []).map(serializeVideo),
    })),
  };
}

export async function getSubjectsCollection() {
  const db = await dbConnect();
  return db.collection("subjects");
}

export default dbConnect;
