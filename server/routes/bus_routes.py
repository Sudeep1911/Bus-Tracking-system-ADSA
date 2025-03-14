from flask import Blueprint, request, jsonify
from controllers.buses import get_buses, locations

# Create a Blueprint for bus routes
bus_routes = Blueprint('bus_routes', __name__)

# Route to get all buses
@bus_routes.route('/', methods=['GET'])
def fetch_buses():
    return get_buses()

# Route to get buses based on source and destination
@bus_routes.route('/', methods=['POST'])
def fetch_locations():
    data = request.json
    source = data.get("source")
    destination = data.get("destination")

    if not source or not destination:
        return jsonify({"error": "Source and destination are required"}), 400

    return locations(source, destination)

