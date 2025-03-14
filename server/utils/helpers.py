import json
from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME, COLLECTION_NAME

def insert_bus_data():
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    try:
        

        # Load JSON data
        with open("data/data.json", "r", encoding="utf-8") as file:
            routes_data = json.load(file)

        # Insert new data
        for route_id, route in routes_data.items():
            bus_document = {
                "routeId": route_id,
                "name": route["name"],
                "type": route["type"],
                "source": route["source"],
                "destination": route["destination"],
                "stages": [{"stage": r["stage"], "place": r["place"]} for r in route["routes"]]
            }
            collection.insert_one(bus_document)

        print(f"✅ Successfully inserted {len(routes_data)} routes.")
    
    except Exception as e:
        print(f"❌ Error inserting data: {e}")
    
    finally:
        client.close()


