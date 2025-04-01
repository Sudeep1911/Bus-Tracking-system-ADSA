from flask import jsonify
from pymongo import MongoClient
import hashlib

from utils.helpers import merge_sort
# MongoDB Connection Details
CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "Bus_details"
COLLECTION_NAME = "coimbatore"
COLLECTION_NAME2="places"

# Create a MongoDB client
client = MongoClient(CONNECTION_URL)
database = client[DATABASE_NAME]

def get_buses():
    """Fetch all buses from the database."""
    try:
        collection = database[COLLECTION_NAME]

        # Fetch all buses from the database
        all_buses = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB's _id field

        return jsonify(all_buses)
    except Exception as error:
        return jsonify({"message": str(error)}), 400

def get_bus_by_location_id(id):
    try:
        collection = database[COLLECTION_NAME]

        # Fetch all buses from the database
        filtered_buses = list(collection.find(
            {"routes.id": id},  # Match buses where any route's 'id' matches bus_id
            {"_id": 0}  # Exclude MongoDB's _id field
        ))
        return jsonify(filtered_buses)
    except Exception as error:
        return jsonify({"message": str(error)}), 400
    
def locations(source, destination,sort):
    """Fetch buses matching the given source and destination."""
    try:
        collection = database[COLLECTION_NAME]
        all_buses = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB's _id field
        
        # Filter buses based on source and destination
        matching_buses = []
        fare = [4, 7, 9, 11, 12, 12, 13, 14, 15, 15, 15, 16, 16, 16, 16]
        
        for bus in all_buses:
            source_route = next((route for route in bus["routes"] if route["id"] == source), None)
            destination_route = next((route for route in bus["routes"] if route["id"] == destination), None)

            if source_route and destination_route:
                source_stage = int(source_route["stage"])
                destination_stage = int(destination_route["stage"])

                if source_stage < destination_stage or source_stage > destination_stage:
                    fare_index = abs(destination_stage - source_stage)
                    bus_fare = fare[fare_index] if fare_index < len(fare) else fare[-1]  # Handle index out of range

                    if bus["type"] == "premium":
                        bus_fare *= 2  # Double the fare for premium buses
                        
                    if source_stage < destination_stage:
                        bus_source = bus["source"]
                        bus_destination = bus["destination"]
                    else:
                        bus_source = bus["destination"]
                        bus_destination = bus["source"]

                    bus_info = {
                        "name": bus["name"],
                        "type": bus["type"],
                        "source": bus_source,
                        "destination": bus_destination,
                        "fare": bus_fare,
                        "fareIndex": fare_index,
                    }
                    matching_buses.append(bus_info)
        if(sort=="all"):
            return matching_buses
        sorted_buses = merge_sort(matching_buses, sort)
        return sorted_buses
    except Exception as error:
        print("Error fetching bus locations:", error)
        raise Exception("Failed to fetch bus locations")
    
def get_place():
    """Fetch all places from the database."""
    try:
        collection = database[COLLECTION_NAME2]
        places = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB's _id field

        return jsonify(places[0])
    except Exception as error:
        return jsonify({"message": str(error)}), 400
    
def post_bus(data):
    try:
        collection = database[COLLECTION_NAME]
        name = data.get("name")
        type_ = data.get("type")
        source_id = data.get("sourceId")
        destination_id = data.get("destinationId")
        source = data.get("source")
        destination = data.get("destination")
        routes = data.get("routes", [])

        # Ensure all required fields are present
        if not all([name, type_, source_id, destination_id, source, destination, isinstance(routes, list)]):
            return jsonify({"message": "Missing or invalid required fields"}), 400

        # Validate routes structure
        for route in routes:
            if not isinstance(route, dict) or "place" not in route or "stage" not in route or "id" not in route:
                return jsonify({"message": "Invalid route structure"}), 400

        # Insert into MongoDB
        new_bus = {
            "name": name,
            "type": type_,
            "sourceId": source_id,
            "destinationId": destination_id,
            "source": source,
            "destination": destination,
            "routes": routes
        }
        result = collection.insert_one(new_bus)

        return jsonify({"message": "Bus added successfully", "busId": str(result.inserted_id)}), 201
    except Exception as error:
        return jsonify({"message":str(error)}),400


def generate_hash(value):
    """Generate a SHA-256 hash of a given string value."""
    return hashlib.sha256(value.encode()).hexdigest()

def post_place(data):
    """Insert a new place into the database."""
    try:
        collection = database[COLLECTION_NAME2]

        place_name = data.get("place")
        if not place_name:
            return jsonify({"message": "Missing required field: place"}), 400

        # Generate a unique hash ID for the place
        place_id = generate_hash(place_name)

        # Insert the new place into the database
        result = collection.update_one(
            {"table_name": "places"},
            {"$set": {f"data.{place_id}": place_name}},
            upsert=True
        )

        return jsonify({"message": "Place added successfully", "placeId": place_id,"place":place_name}), 201
    except Exception as error:
        return jsonify({"message": str(error)}), 400
