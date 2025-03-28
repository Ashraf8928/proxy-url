const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    pincode: { 
        type: String, 
        required: true,
        unique: true 
    },
    latitude: Number,
    longitude: Number,
    formatted_address: String,
    address_components: Array,
    place_id: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Location', locationSchema); 