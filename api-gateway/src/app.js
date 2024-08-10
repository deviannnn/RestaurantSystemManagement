require('dotenv').config();
const express = require("express");
const createError = require('http-errors');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { limiter } = require('./middlewares/limiter'); // Middleware function for rate limiting and timeout handling
const { checkRevokedToken, authenticate } = require('./middlewares/auth'); // Middleware function for verify JWT
const services = require('./config/microservices-routes'); // Define routes and corresponding microservices

// Connect to redis
const Redis = require('./config/redis');
(async () => {
  try {
    await Redis.connect();
    console.log(`Redis connection established on [${Redis.redisUrl}]`);
  } catch (error) {
    console.error('[ERROR] Config -', Redis.redisUrl);
    console.error('[ERROR] Failed to connect to Redis -', error);
    process.exit(1);
  }
})();

const app = express();

app.use(cors()); // Enable CORS
app.use(helmet()); // Add security headers
app.use(morgan("combined")); // Log HTTP requests
app.disable("x-powered-by"); // Hide Express server information
// app.use(limiter); // Apply the rate limit and timeout middleware to the proxy

// Set up proxy middleware for each microservice
services.forEach(({ route, protocol, target }) => {
  const isWebSocket = protocol === 'ws';

  const proxyOptions = {
    target: isWebSocket ? target : `${target}${route}`,
    changeOrigin: true,
    ws: isWebSocket,
    on: {
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        if (!isWebSocket) {
          res.status(500).json({ success: false, error: { header: 'Proxy Error', message: err.message } });
        }
      },
    }
  };

  if (route === '/auth') {
    app.use(`/api${route}`, createProxyMiddleware(proxyOptions));
  } else {
    app.use(`/api${route}`, checkRevokedToken, authenticate, createProxyMiddleware(proxyOptions));
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) { next(createError(404)); });

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);

  const getError = (err) => {
    switch (err.status) {
      case 400:
        return {
          header: 'Bad Request',
          message: err.message || 'Your session has expired or you do not have the necessary permissions to access this resource.'
        };
      case 401:
        return {
          header: 'Unauthorized Access',
          message: err.message || 'Your session has expired or you do not have the necessary permissions to access this resource.'
        };
      case 403:
        return {
          header: 'Access Denied',
          message: err.message || 'You do not have the required permissions to access this resource.'
        };
      case 404:
        return {
          header: 'Resource Not Found',
          message: err.message || 'The resource you are looking for could not be located.'
        };
      case 429:
        return {
          header: 'Rate Limit Exceeded',
          message: err.message || 'You have made too many requests in a short period. Please try again later.'
        };
      default:
        return {
          header: 'Internal Server Error',
          message: err.message || 'An unexpected error occurred on the server. Please try again later or contact support if the issue persists.'
        }
    }
  }

  res.status(err.status || 500).json({ success: false, error: { ...getError(err), data: err.data || {} } });
});

// Define port for Express server
const PORT = process.env.PORT || 5000;

// Start Express server
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}\n`);
});