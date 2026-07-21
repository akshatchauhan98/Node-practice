const mongoose = require('mongoose');

// Define the blueprint
const summarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true    // must be provided
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now  // auto set to current time
    }
});

// Create the Model
const Summary = mongoose.model('Summary', summarySchema);

// Export it
module.exports = Summary;