const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = 3000;

// ========================================
// CHECK ENVIRONMENT VARIABLES
// ========================================

if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is missing in .env');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is missing in .env');
    process.exit(1);
}

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(express.json());

console.log('MongoDB URI loaded:', !!process.env.MONGO_URI);
console.log('JWT secret loaded:', !!process.env.JWT_SECRET);

// ========================================
// USER SCHEMA
// ========================================

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

// ========================================
// JWT AUTHENTICATION MIDDLEWARE
// ========================================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader) {

        console.log('❌ JWT Authentication Failed');
        console.log('Reason: No JWT token provided');

        return res.status(401).json({
            success: false,
            message: 'Access token required',
            tokenValid: false
        });
    }

    const [type, token] = authHeader.split(' ');

    // Invalid format
    if (type !== 'Bearer' || !token) {

        console.log('❌ JWT Authentication Failed');
        console.log('Reason: Invalid Bearer token format');

        return res.status(401).json({
            success: false,
            message: 'Invalid authorization format',
            tokenValid: false
        });
    }

    try {

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        console.log('✅ JWT Authentication Successful');
        console.log('Token belongs to:', decoded.email);

        next();

    } catch (error) {

        console.log('❌ JWT Authentication Failed');
        console.log('Reason:', error.message);
        console.log('JWT Token: REJECTED');

        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            tokenValid: false
        });
    }
}

// ========================================
// HOME
// ========================================

app.get('/', (req, res) => {

    res.json({
        success: true,
        message: 'Angular Login API is running'
    });

});

// ========================================
// REGISTER
// ========================================

app.post('/api/register', async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log('----------------------------');
        console.log('Registration attempt');
        console.log('Email:', email);

        // Check fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });

        }

        // Password length
        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // Check existing user
        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            console.log('User already exists');

            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });

        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            email: normalizedEmail,
            password: hashedPassword
        });

        await user.save();

        console.log('✅ User registered successfully');
        console.log('Email:', normalizedEmail);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id.toString(),
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            'Registration error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Server error'
        });

    }

});

// ========================================
// LOGIN
// ========================================

app.post('/api/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log('----------------------------');
        console.log('Login attempt');
        console.log('Email:', email);

        // Check fields
        if (!email || !password) {

            console.log('❌ JWT Authentication Failed');
            console.log('Reason: Missing email or password');

            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
                token: null
            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        // User doesn't exist
        if (!user) {

            console.log('❌ JWT Authentication Failed');
            console.log('Reason: User not found');
            console.log('JWT Token: NOT GENERATED');

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                token: null
            });

        }

        // Compare password with bcrypt hash
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        // Wrong password
        if (!passwordMatch) {

            console.log('❌ JWT Authentication Failed');
            console.log('Reason: Incorrect password');
            console.log('JWT Token: NOT GENERATED');

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                token: null
            });

        }

        // ========================================
        // PASSWORD CORRECT
        // CREATE JWT
        // ========================================

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        console.log('================================');
        console.log('✅ JWT Authentication Successful');
        console.log('User:', user.email);
        console.log('JWT Token Generated: YES');
        console.log('JWT Token:', token);
        console.log('Token expires in: 1 hour');
        console.log('================================');

        return res.status(200).json({
            success: true,
            message: 'JWT Authentication Successful',
            token: token,
            user: {
                id: user._id.toString(),
                email: user.email
            }
        });

    } catch (error) {

        console.error(
            'Login error:',
            error
        );

        console.log('❌ JWT Authentication Failed');
        console.log('JWT Token: NOT GENERATED');

        return res.status(500).json({
            success: false,
            message: 'Server error',
            token: null
        });

    }

});

// ========================================
// PROTECTED DASHBOARD
// ========================================

app.get(
    '/api/dashboard',
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select('-password');

            if (!user) {

                console.log('User not found');

                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });

            }

            console.log(
                'Protected dashboard accessed by:',
                user.email
            );

            return res.status(200).json({
                success: true,
                message: 'Dashboard data loaded',
                user: {
                    id: user._id.toString(),
                    email: user.email
                }
            });

        } catch (error) {

            console.error(
                'Dashboard error:',
                error
            );

            return res.status(500).json({
                success: false,
                message: 'Server error'
            });

        }

    }
);

// ========================================
// CHECK JWT TOKEN
// ========================================

app.get(
    '/api/auth/check',
    authenticateToken,
    (req, res) => {

        console.log('================================');
        console.log('✅ JWT Token is VALID');
        console.log('Authenticated user:', req.user.email);
        console.log('================================');

        return res.status(200).json({
            success: true,
            message: 'JWT Token is valid',
            tokenValid: true,
            user: {
                id: req.user.userId,
                email: req.user.email
            }
        });

    }
);

// ========================================
// MONGODB CONNECTION
// ========================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(async () => {

        console.log('================================');
        console.log('Connected to MongoDB');

        console.log(
            'Database name:',
            mongoose.connection.name
        );

        // Show users without passwords
        const users =
            await User.find({})
                .select('-password');

        console.log('Users currently in MongoDB:');
        console.log(users);

        console.log('================================');

        // Start server
        app.listen(PORT, () => {

            console.log(
                `Server is running on port ${PORT}`
            );

            console.log(
                `http://localhost:${PORT}`
            );

        });

    })

    .catch((error) => {

        console.error(
            'MongoDB connection failed:',
            error.message
        );

        process.exit(1);

    });