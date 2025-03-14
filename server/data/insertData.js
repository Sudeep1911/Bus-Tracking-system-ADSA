import mongoose from 'mongoose';
import fs from 'fs';
import BusModel from '../models/buses.js'; // Import the Bus model

const CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = "Bus_details";
const COLLECTION_NAME = "coimbatore";

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        // Delete existing data
        await BusModel.deleteMany({});

        // Read JSON file
        const jsonData = fs.readFileSync('data.json', 'utf8');

        // Parse JSON data
        const routesData = JSON.parse(jsonData);

        // Insert each route into the database
        for (const routeId in routesData) {
            const route = routesData[routeId];
            const { name, type, source, destination, routes } = route;
            const stages = routes.map(route => ({ stage: route.stage, place: route.place }));
            const newRoute = new BusModel({
                routeId,
                name,
                type,
                source,
                destination,
                stages
            });
            await newRoute.save();
            console.log(`Route ${routeId} inserted successfully.`);
        }

        console.log('All routes inserted successfully');
    } catch (error) {
        console.error(`Error inserting routes: ${error.message}`);
    }
}).catch((err) => console.log(err.message));
