const express = require('express');
const router = express.Router();

// All API routes will use Supabase client from app.locals
// Authentication is handled client-side with Supabase Auth

// @route   GET /api/health
// @desc    Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Note: Most data operations will be done directly from the frontend
// using the Supabase client for better real-time capabilities

module.exports = router;
