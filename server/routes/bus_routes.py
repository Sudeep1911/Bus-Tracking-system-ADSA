from flask import Blueprint, request, jsonify
from controllers.buses import get_buses, locations,get_place, post_bus,post_place,get_bus_by_location_id,create_graph,create_mst
from flask_cors import cross_origin
# Create a Blueprint for bus routes
bus_routes = Blueprint('bus_routes', __name__)

# Route to get all buses
@bus_routes.route('/', methods=['GET'])
def fetch_buses():
    return get_buses()

@bus_routes.route('/getBusByLocation', methods=["POST"])
def get_bus_by_location():
    data = request.json
    id=data.get("id")
    return get_bus_by_location_id(id)

# Route to get buses based on source and destination
@bus_routes.route('/', methods=['POST'])
@cross_origin(origins="http://localhost:3000")
def fetch_locations():
    data = request.json
    source = data.get("source")
    destination = data.get("destination")   
    sort=data.get("sort")
    if not source or not destination:
        return jsonify({"error": "Source and destination are required"}), 400

    return locations(source, destination,sort)

@bus_routes.route('/get_places', methods=['GET'])
def get_places():
    return get_place()

@bus_routes.route('/addBus',methods=['POST'])
def addBus():
    data=request.json
    return post_bus(data)

@bus_routes.route('/addPlace',methods=['POST'])
def addPlace():
    data=request.json
    return post_place(data)
@bus_routes.route('/graph',methods=['POST'])
def createGraph():
    data=request.json
    source = data.get("source")
    destination = data.get("destination")   
    return create_graph(source, destination)
    
@bus_routes.route('/mst',methods=['POST'])
def createMST():
    data=request.json
    source = data.get("source")
    destination = data.get("destination")  
    result, total_fare = create_mst(source, destination)
    return jsonify({
        "segments": result,
        "totalFare": total_fare
    }), 200