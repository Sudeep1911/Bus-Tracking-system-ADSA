// server/config/mongo.js

import { MongoClient } from 'mongodb';

// Connection URI
const uri = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority";

// Database Name
const dbName = "Bus_details";

// Create a MongoDB client
const client = new MongoClient(uri);

// Function to connect to the MongoDB server and return the collection
export async function getBusCollection() {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Use the specified database
    const db = client.db(dbName);

    // Specify the collection
    const collection = db.collection("coimbatore");

    return collection;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}
