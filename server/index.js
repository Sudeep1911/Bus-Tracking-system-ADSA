import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import busRoutes from './routes/buses.js';
import BusData from './models/buses.js'; // Import the BusData model

const app = express();

// Apply body-parser middleware
app.use(bodyParser.json({ limit: "20mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

// Apply CORS middleware
app.use(cors({ origin: "https://kswayfinder.netlify.app", credentials: true }));

// Use busRoutes for handling routes
app.use('/buses', busRoutes);

const CONNECTION_URL = "mongodb+srv://sudeepkarthigeyan20:sudeep2004@cluster0.6ahbt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () =>
        console.log(`Connection is established and running on port: ${PORT}`)
    );
}).catch((err) => console.log(err.message));


