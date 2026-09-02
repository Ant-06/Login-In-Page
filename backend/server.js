const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {

    const { email, password } = req.body;

    console.log('Login request:', email, password);

    // Hardcoded credentials
    if (email === 'test@gmail.com' && password === 'password123') {

        return res.status(200).json({
            success: true,
            message: 'Login successful'
        });

    }

    return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});