from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB connection details
CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "Bus_details"
COLLECTION_NAME = "coimbatore"

# Connect to MongoDB
client = MongoClient(CONNECTION_URL)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

# Sample Bus Schema Representation
class Bus:
    def __init__(self, name, type, source, destination, routes):
        self.name = name
        self.type = type
        self.source = source
        self.destination = destination
        self.routes = routes

    def to_dict(self):
        return {
            "name": self.name,
            "type": self.type,
            "source": self.source,
            "destination": self.destination,
            "routes": self.routes
        }

# Endpoint to find buses by source and destination
@app.route('/buses', methods=['GET'])
def get_buses():
    try:
        source = request.args.get('source')
        destination = request.args.get('destination')

        if not source or not destination:
            return jsonify({"error": "Source and destination are required"}), 400

        # Query MongoDB for buses matching source and destination
        buses = list(collection.find({"source": source, "destination": destination}))

        # Convert ObjectId to string
        for bus in buses:
            bus['_id'] = str(bus['_id'])

        return jsonify(buses), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
