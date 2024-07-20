// Require packages
require('dotenv').config();
const express = require("express");
const createError = require('http-errors');
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

// Connect to redis
const Redis = require('./config/redis');
(async () => {
  try {
    await Redis.connect();
    console.log('Redis is connected');
  } catch (error) {
    console.error('Failed to start Redis:', error);
    process.exit(1); // Exit the process with error
  }
});

// Create an instance of Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS
app.use(helmet()); // Add security headers
app.use(morgan("combined")); // Log HTTP requests
app.disable("x-powered-by"); // Hide Express server information

// Define routes and corresponding microservices
const services = [
  { route: "/categories", target: "http://localhost:5001/categories" },
  { route: "/items", target: "http://localhost:5001/items" },
  { route: "/orders", target: "http://localhost:5004/orders" },
  { route: "/orders-items", target: "http://localhost:5004/orders-items" },
  { route: "/payments", target: "http://localhost:5005/payments" },
  { route: "/surcharges", target: "http://localhost:5005/surcharges" },
  { route: "/payments-surcharges", target: "http://localhost:5005/payments-surcharges" },
  { route: "/tables", target: "http://localhost:5006/tables" },
  { route: "/auth", target: "http://localhost:5007/auth" },
  { route: "/users", target: "http://localhost:5007/users" },
  { route: "/roles", target: "http://localhost:5007/roles" }
];

// Middleware function for verify JWT
const { checkRevokedToken, verifyToken } = require('./middlewares/auth');

// Middleware function for rate limiting and timeout handling
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20, // Giới hạn mỗi IP 20 yêu cầu mỗi phút
  handler: (req, res, next) => {
    next(createError(429));
  }
});

// Apply the rate limit and timeout middleware to the proxy
app.use(limiter);

// Set up proxy middleware for each microservice
services.forEach(({ route, target }) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: { [`^${route}`]: "" },
    on: {
      proxyReq: (proxyReq, req, res) => {
        req.setTimeout(15000); // Đặt timeout cho yêu cầu là 15 giây
        if (req.user) {
          proxyReq.user = req.user;
          proxyReq.setHeader('x-user', JSON.stringify(req.user)); // Thêm thông tin user vào header nếu có
        }
      },
      proxyRes: (proxyRes, req, res) => { },
      error: (err, req, res) => {
        console.error('Proxy error:', err);
        next(err);
      },
    }
  };

  if (route === '/auth') {
    // Route /auth without authentication middleware
    app.use(route, createProxyMiddleware(proxyOptions));
  } else {
    // Apply authentication middleware for all other routes
    app.use(route, checkRevokedToken, verifyToken, createProxyMiddleware(proxyOptions));
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
  console.log(`\nAPI Gateway is running on port ${PORT}\n`);
});