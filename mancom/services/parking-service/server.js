const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Middleware for enabling CORS
const helmet = require('helmet'); // Security middleware
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const winston = require('winston'); // Logging library
const multer = require('multer'); // File upload middleware
const path = require('path'); // Node.js path module
const cookieParser = require('cookie-parser'); // Cookie parsing middleware
require('dotenv').config(); // Load environment variables from .env file

// Import route modules
const vehicleRoutes = require('./routes/vehicles'); // Routes for vehicle operations
const authRoutes = require('./routes/auth'); // Routes for authentication
const exportRoutes = require('./routes/exports'); // Routes for data exports
const parkingSecurity = require('./middleware/parkingSecurity'); // Parking Sentinel Security

// Create Express application instance
const app = express();
const PORT = process.env.PORT;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vnr-parking-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const hpp = require('hpp'); // HTTP Parameter Pollution protection

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit: 5 login attempts per 15 mins
  message: 'Too many login attempts, please try again later after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 requests for general auth routes (profile, register)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com", process.env.FRONTEND_URL],
      frameSrc: ["'self'", "https://accounts.google.com", process.env.FRONTEND_URL],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  hidePoweredBy: true // Explicitly hide X-Powered-By
})); // Apply security headers with enhanced protections

// Additional security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // XSS Protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// LEVEL 1 & 2: Parking Security Middlewares
app.use(parkingSecurity.workerStressMonitor); // Monitor Node.js event loop lag
app.use(parkingSecurity.neuralBlacklistMiddleware); // Drop blacklisted IPs early
app.use(parkingSecurity.honeyPotMiddleware); // Intercept and ban attackers
app.use(limiter); // Baseline rate limiting
app.use(parkingSecurity.dynamicRateLimiter); // Security Switcher limits per second
app.use(parkingSecurity.wafMiddleware); // WAF blocks SQLi, XSS, Scanners
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3202', 'http://localhost:5173'], // Frontend origin
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400, // Cache preflight requests for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
})); // Enable Cross-Origin Resource Sharing with credentials
app.use(cookieParser(process.env.JWT_SECRET)); // Parse cookies for authentication

// Production cookie security
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (necessary for Vercel/Heroku)
}

// Body parsing with route-specific limits
// Allow larger body ONLY for profile update (image upload via Base64)
app.use('/api/auth/profile', express.json({ limit: '10mb' }));
// Strict limit for all other routes to prevent DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded request bodies with size limit
app.use(hpp()); // HTTP Parameter Pollution protection

// Run Threat Intelligence after body parsing so it can inspect requests effectively
app.use(parkingSecurity.threatIntelligenceEngine);

// Import sanitization middleware
const { sanitizeBody, sanitizeQuery, sanitizeSensitiveFields } = require('./middleware/sanitization');

// Apply sanitization middleware (XSS protection)
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(sanitizeSensitiveFields);

// Make logger available in routes
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Route mounting
app.use('/api/auth/login', loginLimiter); // Apply STRICT login limiter
app.use('/api/auth', authLimiter, authRoutes); // Mount authentication routes with general auth limiting
app.use('/api/users', require('./routes/users')); // Mount user management routes (Super Admin)
app.use('/api/vehicles', vehicleRoutes(upload)); // Mount vehicle routes at /api/vehicles
app.use('/api/parking', require('./routes/parking')); // Mount parking routes
app.use('/api/qr', require('./routes/qrRoutes')); // Mount QR routes
app.use('/api/settings', require('./routes/settings')); // Mount settings routes
app.use('/api/exports', exportRoutes); // Mount export routes at /api/exports
app.use('/api/analytics', require('./routes/analytics')); // Mount analytics routes

// Health check endpoint to verify server status
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'VNR Parking API is running' });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error with Winston
  if (req.logger && req.logger.error) {
    req.logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
  } else {
    console.error('Unhandled error:', err);
  }

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }

  // Handle custom errors
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // Default error response
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle React routing for non-API routes
  app.get('*', (req, res, next) => {
    // If it's an API request that wasn't handled, next() to 404 handler
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the app
module.exports = app;

// Start the server if running directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 VNR Parking API server is running on port ${PORT}`);
  });
}
