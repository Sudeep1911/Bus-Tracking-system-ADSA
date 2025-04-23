import itertools
from flask import jsonify
from pymongo import MongoClient
import hashlib
from collections import deque
import heapq

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
                    bus_fare = fare[fare_index-1] if fare_index < len(fare) else fare[-1]  # Handle index out of range

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

def put_bus(data,bus_id):
    try:
        collection = database[COLLECTION_NAME]


        # Extract and validate data
        name = data.get("name")
        type_ = data.get("type")
        source_id = data.get("sourceId")
        destination_id = data.get("destinationId")
        source = data.get("source")
        destination = data.get("destination")
        routes = data.get("routes", [])

        if not all([name, type_, source_id, destination_id, source, destination, isinstance(routes, list)]):
            return jsonify({"message": "Missing or invalid required fields"}), 400

        for route in routes:
            if not isinstance(route, dict) or "place" not in route or "stage" not in route or "id" not in route:
                return jsonify({"message": "Invalid route structure"}), 400

        # Prepare update payload
        update_data = {
            "name": name,
            "type": type_,
            "sourceId": source_id,
            "destinationId": destination_id,
            "source": source,
            "destination": destination,
            "routes": routes
        }

        result = collection.update_one(
            {"name": bus_id},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"message": "Bus not found"}), 404

        return jsonify({"message": "Bus updated successfully"}), 200

    except Exception as error:
        return jsonify({"message": str(error)}), 400
    
def deletes_bus(bus_id):
    collection = database[COLLECTION_NAME]
    result = collection.delete_one({'name': bus_id})
    if result.deleted_count == 1:
        return jsonify({"message": "Bus deleted"}), 200
    else:
        return jsonify({"message": "Bus not found"}), 404
    
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

def merge_consecutive_routes(routes):
    if not routes:
        return []
    print(routes)

    merged = [routes[0]]

    for i in range(1, len(routes)):
        prev = merged[-1]
        current = routes[i]

        # If same bus and continuous stops
        if current['name'] == prev['name'] and current['source'] == prev['destination']:
            # Just update the destination and fare (accumulate)
            prev['destination'] = current['destination']
            prev['fare'] += current['fare']
            prev['fareIndex']+=current['fareIndex']
        else:
            merged.append(current)

    return merged
        
def create_graph(source_id, destination_id):
    class MultiBusRouteGraph:
        def __init__(self):
            self.graph = {}  # stop_id -> list of (neighbor_id, bus_name, weight)
            self.stop_names = {}  # stop_id -> place_name
            self.bus_routes = {}  # bus_name -> list of stop_ids
            self.bus_info = {}  # (stop1, stop2, bus_name) -> dict with fare/type/name

        def add_bus_routes(self, bus_data_list):
            for bus in bus_data_list:
                bus_name = bus["name"]
                bus_type = bus.get("type", "unknown")
                route = bus["routes"]
                stop_ids = [stop["id"] for stop in route]

                self.bus_routes[bus_name] = stop_ids

                for stop in route:
                    self.stop_names[stop["id"]] = stop["place"]

                for i in range(len(route) - 1):
                    stop1_id = route[i]["id"]
                    stop2_id = route[i + 1]["id"]

                    self.graph.setdefault(stop1_id, []).append((stop2_id, bus_name, 1))
                    self.graph.setdefault(stop2_id, []).append((stop1_id, bus_name, 1))

                    self.bus_info[(stop1_id, stop2_id, bus_name)] = {
                        "type": bus_type,
                        "name": bus_name,
                        "route": stop_ids
                    }
                    self.bus_info[(stop2_id, stop1_id, bus_name)] = {
                        "type": bus_type,
                        "name": bus_name,
                        "route": stop_ids
                    }

        def find_shortest_path(self, source_id, destination_id):
            if source_id not in self.graph or destination_id not in self.graph:
                return {
                    "nodes": [],
                    "edges": [],
                    "highlightedPath": [],
                    "segments": []
                }

            counter = itertools.count()
            pq = [(0, next(counter), source_id, [], None)]
            visited = {}

            path_to_highlight = []

            while pq:
                dist, _, node, path, last_bus = heapq.heappop(pq)

                if node in visited and visited[node] <= dist:
                    continue
                visited[node] = dist

                path = path + [(node, last_bus)]

                if node == destination_id:
                    path_to_highlight = path
                    break

                for neighbor, bus, weight in self.graph.get(node, []):
                    transfer_penalty = 1 if last_bus and bus != last_bus else 0
                    heapq.heappush(pq, (dist + weight + transfer_penalty, next(counter), neighbor, path, bus))

            # Build segments from path
            segments = []
            for i in range(1, len(path_to_highlight)):
                start, _ = path_to_highlight[i - 1]
                end, bus_name = path_to_highlight[i]
                info = self.bus_info.get((start, end, bus_name))
                if not info:
                    continue

                route = info["route"]
                try:
                    start_index = route.index(start)
                    end_index = route.index(end)
                except ValueError:
                    start_index = end_index = 0

                fare_index = abs(end_index - start_index)
                fare_array = [4, 7, 9, 11, 12, 12, 13, 14, 15, 15, 15, 16, 16, 16, 16]
                fare = fare_array[fare_index - 1] if fare_index < len(fare_array) else (fare_array[-1] if fare_array else 0)

                if info.get("type") == "premium":
                    fare *= 2

                segments.append({
                    "name": info["name"],
                    "type": info["type"],
                    "source": self.stop_names[start],
                    "destination": self.stop_names[end],
                    "fare": fare,
                    "fareIndex": fare_index
                })

            # Nodes (bus stops)
            nodes = [
                {"id": place_name, "label": place_name}
                for stop_id, place_name in self.stop_names.items()
            ]

            # Edges (bus route connections)
            edges = []
            added_edges = set()
            for (stop1, stop2, bus), info in self.bus_info.items():
                if (stop1, stop2, bus) in added_edges:
                    continue
                added_edges.add((stop1, stop2, bus))
                added_edges.add((stop2, stop1, bus))  # avoid reverse duplicates

                route = info["route"]
                try:
                    idx1 = route.index(stop1)
                    idx2 = route.index(stop2)
                    fare_index = abs(idx1 - idx2)
                except ValueError:
                    fare_index = 1

                fare_array = [4, 7, 9, 11, 12, 12, 13, 14, 15, 15, 15, 16, 16, 16, 16]
                fare = fare_array[fare_index - 1] if fare_index < len(fare_array) else (fare_array[-1] if fare_array else 0)
                if info["type"] == "premium":
                    fare *= 2

                source_name = self.stop_names[stop1]
                target_name = self.stop_names[stop2]

                edges.append({
                    "id": f"{source_name}-{target_name}-{bus}",
                    "source": source_name,
                    "target": target_name,
                    "label": f"{bus} (₹{fare})",
                    "bus": bus,
                    "fare": fare,
                    "type": info["type"]
                })

            # Highlighted path
            highlighted_edges = []
            for i in range(1, len(path_to_highlight)):
                start, _ = path_to_highlight[i - 1]
                end, bus_name = path_to_highlight[i]
                start_name = self.stop_names[start]
                end_name = self.stop_names[end]
                highlighted_edges.append(f"{start_name}-{end_name}-{bus_name}")

            data=merge_consecutive_routes(segments)
            return {
                "nodes": nodes,
                "edges": edges,
                "highlightedPath": highlighted_edges,
                "segments": data
            }

    # Step 1: Fetch all buses
    collection = database[COLLECTION_NAME]
    bus_data = list(collection.find({}, {"_id": 0}))

    # Step 2: Build graph
    graph = MultiBusRouteGraph()
    graph.add_bus_routes(bus_data)

    # Step 3: Return full graph with highlighted route
    return graph.find_shortest_path(source_id, destination_id)



def create_mst(source_id, destination_id):
    import heapq
    import itertools

    class MSTGraph:
        def __init__(self):
            self.graph = {}  # stop_id -> list of (neighbor_id, bus_name)
            self.stop_names = {}  # stop_id -> place name
            self.bus_routes = {}  # bus_name -> list of stop_ids
            self.bus_info = {}  # (u, v, bus_name) -> bus metadata
            self.fare_array = [4, 7, 9, 11, 12, 12, 13, 14, 15, 15, 15, 16, 16, 16, 16]

        def add_bus_data(self, bus_data):
            for bus in bus_data:
                bus_name = bus["name"]
                bus_type = bus.get("type", "normal")
                route = bus["routes"]
                stop_ids = [stop["id"] for stop in route]

                self.bus_routes[bus_name] = stop_ids
                for stop in route:
                    self.stop_names[stop["id"]] = stop["place"]

                for i in range(len(stop_ids) - 1):
                    u, v = stop_ids[i], stop_ids[i + 1]

                    self.graph.setdefault(u, []).append((v, bus_name))
                    self.graph.setdefault(v, []).append((u, bus_name))  # Undirected

                    self.bus_info[(u, v, bus_name)] = {
                        "name": bus_name,
                        "type": bus_type,
                        "route": stop_ids
                    }
                    self.bus_info[(v, u, bus_name)] = {
                        "name": bus_name,
                        "type": bus_type,
                        "route": list(reversed(stop_ids))
                    }

        def compute_fare(self, u, v, bus_name):
            route = self.bus_routes.get(bus_name, [])
            try:
                i, j = route.index(u), route.index(v)
                fare_index = abs(j - i)
                fare = self.fare_array[fare_index - 1] if fare_index < len(self.fare_array) else self.fare_array[-1]
                if self.bus_info[(u, v, bus_name)]["type"] == "premium":
                    fare *= 2
                return fare, fare_index
            except ValueError:
                return None, None

        def build_mst(self, source_id):
            visited = set()
            parent_map = {}
            mst_edges = []
            counter = itertools.count()
            min_heap = []

            visited.add(source_id)
            for neighbor, bus_name in self.graph.get(source_id, []):
                fare, fare_index = self.compute_fare(source_id, neighbor, bus_name)
                if fare is not None:
                    heapq.heappush(min_heap, (fare, next(counter), source_id, neighbor, bus_name, fare_index))

            while min_heap:
                fare, _, u, v, bus_name, fare_index = heapq.heappop(min_heap)
                if v in visited:
                    continue
                visited.add(v)
                parent_map[v] = (u, bus_name, fare, fare_index)
                mst_edges.append((u, v, bus_name, fare, fare_index))

                for neighbor, next_bus in self.graph.get(v, []):
                    if neighbor in visited:
                        continue
                    nf, nf_index = self.compute_fare(v, neighbor, next_bus)
                    if nf is not None:
                        heapq.heappush(min_heap, (nf, next(counter), v, neighbor, next_bus, nf_index))

            return parent_map, mst_edges

        def reconstruct_path(self, parent_map, source_id, destination_id):
            path = []
            total_fare = 0
            current = destination_id

            while current != source_id:
                if current not in parent_map:
                    return [], 0  # No path

                u, bus, fare, fare_index = parent_map[current]
                info = self.bus_info.get((u, current, bus))
                if not info:
                    break

                segment = {
                    "name": info["name"],
                    "type": info["type"],
                    "source": self.stop_names.get(u, str(u)),
                    "destination": self.stop_names.get(current, str(current)),
                    "fare": fare,
                    "fareIndex": fare_index
                }
                total_fare += fare
                path.append(segment)
                current = u

            return path[::-1], total_fare

        def generate_nodes_and_edges(self, mst_edges):
            seen = set()
            nodes = []
            edges = []

            for u, v, bus_name, fare, fare_index in mst_edges:
                source_name = self.stop_names.get(u, str(u))
                target_name = self.stop_names.get(v, str(v))

                if source_name not in seen:
                    seen.add(source_name)
                    nodes.append({
                        "id": source_name,
                        "label": source_name
                    })

                if target_name not in seen:
                    seen.add(target_name)
                    nodes.append({
                        "id": target_name,
                        "label": target_name
                    })

                info = self.bus_info.get((u, v, bus_name)) or self.bus_info.get((v, u, bus_name))

                edges.append({
                    "id": f"{source_name}-{target_name}-{bus_name}",
                    "source": source_name,
                    "target": target_name,
                    "label": f"{bus_name} (₹{fare})",
                    "bus": bus_name,
                    "fare": fare,
                    "type": info["type"] if info else "normal"
                })

            return nodes, edges


    # Load data from DB
    collection = database[COLLECTION_NAME]
    bus_data = list(collection.find({}, {"_id": 0}))

    # Build and compute MST
    graph = MSTGraph()
    graph.add_bus_data(bus_data)
    parent_map, mst_edges = graph.build_mst(source_id)
    segments, total_fare = graph.reconstruct_path(parent_map, source_id, destination_id)
    nodes, edges = graph.generate_nodes_and_edges(mst_edges)
    data=merge_consecutive_routes(segments)
    return {
        "nodes": nodes,
        "edges": edges,
        "segments": data,
        "totalFare": total_fare
    }