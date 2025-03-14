from flask import Blueprint, jsonify
from models.bus_model import get_buses  # Import the function from bus_model

bus_controller = Blueprint('bus_controller', __name__)

@bus_controller.route('/buses', methods=['GET'])
def get_buses_route():
    try:
        buses = get_buses() 
        print('Retrieved Buses:', buses)  
        return jsonify(buses), 200  
    except Exception as error:
        print('Error fetching buses:', error)
        return jsonify({"message": "Internal server error"}), 500
 
