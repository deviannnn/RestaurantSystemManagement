const createError = require('http-errors');
const rateLimit = require('express-rate-limit');

// Middleware function for rate limiting and timeout handling
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit per IP to 20 requests per minute
    handler: (req, res, next) => {
        next(createError(429));
    }
});

module.exports = { limiter };