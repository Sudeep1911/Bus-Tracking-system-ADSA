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


def merge_sort(buses, sort):
    """Sort the buses using merge sort based on the given sort criteria."""
    if len(buses) <= 1:
        return buses
    
    mid = len(buses) // 2
    left = merge_sort(buses[:mid], sort)
    right = merge_sort(buses[mid:], sort)

    return merge(left, right, sort)

def merge(left, right, sort):
    """Merge function for merge sort."""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if sort == "stops":
            # Sort by fareIndex (number of stops)
            if left[i]["fareIndex"] < right[j]["fareIndex"]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        elif sort == "fare":
            # Sort by fare
            if left[i]["fare"] < right[j]["fare"]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
    
    # Append remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result