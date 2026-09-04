const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('MongoDB URI loaded:', !!process.env.MONGO_URI);

// User schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// User model
const User = mongoose.model('User', userSchema);

// Login API
app.post('/api/login', async (req, res) => {

    try {
        const { email, password } = req.body;

        console.log('------------------------');
        console.log('Login attempt');
        console.log('Email received:', email);
        console.log('Password received:', password);

        // Check empty fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: email
        });

        console.log('User found:', user);

        if (!user) {
            console.log('❌ No user found with this email');

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare password
        console.log('Password in database:', user.password);

        if (user.password !== password) {
            console.log('❌ Password does not match');

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ Login successful');

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {

        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)

    .then(() => {

        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    })

    .catch((error) => {

        console.error('MongoDB connection failed:', error);

    });