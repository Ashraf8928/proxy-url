const express = require('express');
const axios = require('axios');
const { inject } = require("@vercel/analytics");
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = 3000;

dotenv.config();

const API_KEY = process.env.API_KEY; // Secure API Key (server-side only)

// Enable CORS for the specified URL
app.use(cors({
    origin: 'https://www.nilkamalhomes.com'
}));

// Enable JSON parsing
app.use(express.json());

app.get('/get-latlong', async (req, res) => {
    console.log(req.query.pincode);
    const pincode = req.query.pincode;
    
    if (!pincode) {
        return res.status(400).json({ error: "Pincode is required" });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = {
                latitude: data.results[0].geometry.location.lat,
                longitude: data.results[0].geometry.location.lng,
                formatted_address: data.results[0].formatted_address,
                locality: data.results[0].postcode_localities,
                place_id: data.results[0].place_id
            };
            res.json(result);
        } else {
            res.status(404).json({
                error: "Location not found",
                status: data.status,
                full_response: data
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
    console.log(`Server running on port ${PORT}`);
    console.log(`Test the API at: http://localhost:${PORT}/get-latlong?pincode=YOUR_PINCODE`);
});