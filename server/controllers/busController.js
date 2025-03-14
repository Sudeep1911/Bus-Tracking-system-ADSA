import express from 'express';
import { getBuses } from './buses.js'; // Update the file path accordingly

const app = express();
const PORT = 3001; // Set the desired port number, should match the port in the URL

// Define a route to retrieve buses
app.get('/buses', async (req, res) => {
    try {
        const buses = await getBuses(); // Call the function directly, assuming it's an asynchronous function
        console.log('Retrieved Buses:', buses); // Log the retrieved buses
        res.status(200).json(buses); // Send the retrieved buses as JSON response
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
