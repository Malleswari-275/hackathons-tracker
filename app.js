const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Connect to Database
connectDB();

// CORS — frontend (Cloudflare Pages) and API (EC2) are on different origins.
// CORS_ORIGIN is a comma-separated allowlist of frontend origins.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server (no Origin header) and any allowlisted origin
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Express Configuration Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads folder statically for profile images access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Prefix all api routes
app.use('/api', routes);

// Fallback Route for non-existing endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`
  });
});

// Central Error Handler Middleware
app.use(errorHandler);

module.exports = app;