import json
from pymongo import MongoClient
from config import MONGO_URI  # Import MongoDB connection string

# MongoDB configuration
DATABASE_NAME = "Bus_details"
COLLECTION_NAME = "coimbatore"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

def insert_bus_data():
    try:
        # Delete existing data
        collection.delete_many({})
        print("🗑️ Existing data deleted.")

        # Read JSON file
        with open("data/data.json", "r", encoding="utf-8") as file:
            routes_data = json.load(file)

        # Insert each route into MongoDB
        inserted_count = 0
        for route_id, route in routes_data.items():
            name = route["name"]
            type_ = route["type"]
            source = route["source"]
            destination = route["destination"]
            stages = [{"stage": r["stage"], "place": r["place"]} for r in route["routes"]]

            # Create document
            bus_document = {
                "routeId": route_id,
                "name": name,
                "type": type_,
                "source": source,
                "destination": destination,
                "stages": stages
            }

            collection.insert_one(bus_document)
            print(f"✅ Route {route_id} inserted successfully.")
            inserted_count += 1

        print(f" {inserted_count} routes inserted successfully.")

    except Exception as e:
        print(f" Error inserting routes: {e}")

    finally:
        client.close()

# Run the function
if __name__ == "__main__":
    insert_bus_data()
