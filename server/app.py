from flask import Flask
from flask_cors import CORS 
from pymongo import MongoClient
from routes.bus_routes import bus_routes  # Import the buses routes

app = Flask(__name__)

# Apply CORS middleware
CORS(app, resources={r"/buses/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Use Blueprint for routes
app.register_blueprint(bus_routes, url_prefix='/buses')

# MongoDB connection
CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(CONNECTION_URL)

try:
    db = client["Bus_details"]  # Database name
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Start the server
if __name__ == "__main__":
    app.run(debug=True, port=5000)

