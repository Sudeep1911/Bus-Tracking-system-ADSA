import { MongoClient, ObjectId } from 'mongodb';

const CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = "Bus_details";
const COLLECTION_NAME = "coimbatore";
const DOCUMENT_ID = "66007b5cc44951b2f396ffb7";

const client = new MongoClient(CONNECTION_URL);

async function run() {
    try {
        await client.connect();

        const database = client.db(DATABASE_NAME);
        const collection = database.collection(COLLECTION_NAME);

        // Convert the string _id to ObjectId
        const objectId = new ObjectId(DOCUMENT_ID);

        // Find the document by its _id
        const document = await collection.findOne({ _id: objectId });

        if (document) {
            // Modify the logging statement to stringify the document
            console.log("Document:", JSON.stringify(document, null, 2));

        } else {
            console.log("Document not found.");
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await client.close();
    }
}

run().catch(console.error);
