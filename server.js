console.log("THIS FILE IS RUNNING");
console.log(__filename);

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Summary model
const Summary = require('./models/Summary');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
console.log("TEST ROUTE LOADED");
app.get("/test", (req, res) => {
    res.send("GET test route working");
});

app.post("/test-post", (req, res) => {
    res.send("POST test route working");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((error) => console.log("❌ Error:", error));

// Home route

app.get('/', (req, res) => {
    res.send("SmartPrep AI Backend with MongoDB!");
});

// ============================================
// SUMMARY ROUTES (with real database)
// ============================================

// 1. GET all summaries
app.get('/api/summaries', async (req, res) => {
    try {
        const summaries = await Summary.find();
        res.status(200).json({
            success: true,
            count: summaries.length,
            data: summaries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 2. GET single summary by ID
app.get('/api/summaries/:id', async (req, res) => {
    try {
        const summary = await Summary.findById(req.params.id);
        
        if (!summary) {
            return res.status(404).json({
                success: false,
                message: "Summary not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 3. POST create new summary
app.post('/api/summaries', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }
        
        const newSummary = await Summary.create({
            title: title,
            content: content
        });
        
        res.status(201).json({
            success: true,
            message: "Summary created successfully!",
            data: newSummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 4. DELETE summary by ID
app.delete('/api/summaries/:id', async (req, res) => {
    try {
        const summary = await Summary.findByIdAndDelete(req.params.id);
        
        if (!summary) {
            return res.status(404).json({
                success: false,
                message: "Summary not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Summary deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});