from flask import jsonify
from pymongo import MongoClient

# MongoDB Connection Details
CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "Bus_details"
COLLECTION_NAME = "coimbatore"

# Create a MongoDB client
client = MongoClient(CONNECTION_URL)

def get_buses():
    """Fetch all buses from the database."""
    try:
        database = client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]

        # Fetch all buses from the database
        all_buses = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB's _id field

        return jsonify(all_buses)
    except Exception as error:
        return jsonify({"message": str(error)}), 400

def locations(source, destination):
    """Fetch buses matching the given source and destination."""
    try:
        database = client[DATABASE_NAME]
        collection = database[COLLECTION_NAME]

        # Filter buses based on source and destination
        matching_buses = list(collection.find({"source": source, "destination": destination}, {"_id": 0}))

        return matching_buses
    except Exception as error:
        print("Error fetching bus locations:", error)
        raise Exception("Failed to fetch bus locations")
