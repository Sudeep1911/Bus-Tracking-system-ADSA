import { MongoClient } from 'mongodb';

const CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = "Bus_details";
const COLLECTION_NAME = "coimbatore";

const client = new MongoClient(CONNECTION_URL);

export const getBuses = async (req, res) => {
    try {
        await client.connect();

        const database = client.db(DATABASE_NAME);
        const collection = database.collection(COLLECTION_NAME);

        // Fetch all buses from the database
        const allBuses = await collection.find().toArray();

        // Send the retrieved data as JSON response
        res.status(200).json(allBuses);
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handle errors
    } finally {
        await client.close();
    }
};

export const locations = async (source, destination) => {
    try {
        await client.connect();

        const database = client.db(DATABASE_NAME);
        const collection = database.collection(COLLECTION_NAME);

        // Filter buses from the database based on source and destination
        const matchingBuses = await collection.find({ source: source, destination: destination }).toArray();

        return matchingBuses;
    } catch (error) {
        // Handle errors by logging or re-throwing the error
        console.error('Error fetching bus locations:', error);
        throw new Error('Failed to fetch bus locations'); // Optionally, re-throw the error
    } finally {
        await client.close();
    }
};
