const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');
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
console.log("Mongo URI:");
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((error) => console.log("❌ Error:", error));
//register route
// ============================================
// AUTH ROUTES
// Protected route - only logged in users can access
app.get('/api/summaries', authMiddleware, async (req, res) => {
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
// ============================================

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        // Create JWT token
        const token = jwt.sign(
            { userId: newUser._id },        // payload
            process.env.JWT_SECRET,          // secret
            { expiresIn: '7d' }              // token expires in 7 days
        );

        // Send response (don't send password back!)
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user in database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password with hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log(token);

        // Send response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
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