from flask import Flask, jsonify
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)

# MongoDB connection details
CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "Bus_details"
COLLECTION_NAME = "coimbatore"

# Connect to MongoDB
client = MongoClient(CONNECTION_URL)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

@app.route('/bus/<bus_id>', methods=['GET'])
def get_bus(bus_id):
    try:
        # Convert bus_id to ObjectId
        object_id = ObjectId(bus_id)
        
        # Find the document
        document = collection.find_one({"_id": object_id})

        if document:
            # Convert ObjectId to string for JSON response
            document['_id'] = str(document['_id'])
            return jsonify(document), 200
        else:
            return jsonify({"message": "Document not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
