require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(__dirname));

// Define specific routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/activity', (req, res) => {
    res.sendFile(path.join(__dirname, 'activity.html'));
});

app.get('/meals', (req, res) => {
    res.sendFile(path.join(__dirname, 'meals.html'));
});

app.get('/insights', (req, res) => {
    res.sendFile(path.join(__dirname, 'insights.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Open your browser and navigate to http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('❌ Server error:', err);
});
