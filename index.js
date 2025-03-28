const express = require('express');
const axios = require('axios');
const { inject } = require("@vercel/analytics");
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Location = require('./models/Location');

const app = express();
const PORT = 3000;

dotenv.config();
connectDB(); // MongoDB connection initialize

const API_KEY = process.env.API_KEY; // Secure API Key (server-side only)

// Enable CORS for the specified URL
app.use(cors({
    origin: 'https://www.nilkamalhomes.com'
}));

// Enable JSON parsing
app.use(express.json());

app.get('/get-latlong', async (req, res) => {
   // console.log(req.query.pincode);
    const pincode = req.query.pincode;
    
    if (!pincode) {
        return res.status(400).json({ error: "Pincode is required" });
    }

    try {
        // Check if pincode exists in MongoDB
        let location = await Location.findOne({ pincode });

        if (location) {
            // If found in database, return cached data
            //console.log("Location found in database");
            return res.json({
                latitude: location.latitude,
                longitude: location.longitude,
                formatted_address: location.formatted_address,
                address_components: location.address_components,
                place_id: location.place_id,
                source: 'cache'
            });
        }

        // If not found in database, fetch from Google API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${API_KEY}`;
        const response = await axios.get(url);
        const data = response.data;
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          //  console.log("Location not found in database we are fetching from google api");
            const result = {
                pincode,
                latitude: data.results[0].geometry.location.lat,
                longitude: data.results[0].geometry.location.lng,
                formatted_address: data.results[0].formatted_address,
                address_components: data.results[0].address_components,
                place_id: data.results[0].place_id
            };

            // Save to MongoDB
            await Location.create(result);

            // Add source information to response
            result.source = 'google';
            res.json(result);
        } else {
            res.status(404).json({
                error: "Location not found",
                status: data.status
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: "Error fetching data",
            message: error.message
        });
    }
});

// Test endpoint to verify server is running
app.get('/', (req, res) => {
    res.json({ message: "Server is running. Use /get-latlong?pincode=YOUR_PINCODE to get location data" });
});

app.listen(PORT, () => {
   // console.log(`Server running on port ${PORT}`);
  //  console.log(`Test the API at: http://localhost:${PORT}/get-latlong?pincode=YOUR_PINCODE`);
});