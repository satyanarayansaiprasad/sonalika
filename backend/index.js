const express = require('express');
require('dotenv').config();
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection (using URI from .env)
// Use connection options that prevent hanging
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain a minimum of 2 socket connections
    // Note: bufferCommands defaults to true, which allows commands to be buffered
    // until connection is ready. This prevents errors when queries run before connection.
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit - let server start even if DB connection fails initially
    // Render will retry the connection
  });

// Load allowed origins from .env and split into an array
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sonalika.vercel.app',
  'https://sonalika.onrender.com'
];

// Normalize origins by removing trailing slashes and ensuring proper format
const normalizedOrigins = allowedOrigins.map(origin => origin.trim().replace(/\/$/, ''));

console.log('Allowed Origins:', normalizedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Request from origin:', origin);
    console.log('Normalized allowed origins:', normalizedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided - allowing request');
      return callback(null, true);
    }
    
    // Normalize the incoming origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    if (normalizedOrigins.includes(normalizedOrigin)) {
      console.log('Origin allowed:', normalizedOrigin);
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin, '(normalized:', normalizedOrigin, ')');
      console.log('Available origins:', normalizedOrigins);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// CORS middleware handles preflight requests automatically - no need for app.options('*')

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' })); // Increase payload size limit for file uploads

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
  })
);

// Routes - using your existing route files
// Wrap in try-catch to prevent server crash if routes fail to load
try {
  const adminRoutes = require('./routes/adminRoutes');
  const teamRoutes = require('./routes/teamRoutes');
  const pteamRoutes = require('./routes/pteamRoutes');
  const orderRoutes = require('./routes/orderRoutes');
  const inventoryRoutes = require('./routes/inventoryRoutes');
  const departmentRoutes = require('./routes/departmentRoutes');

  app.use('/api/admin', adminRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/pdmaster', pteamRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/departments', departmentRoutes);

  // Log all registered routes for debugging
  console.log('✅ Routes registered:');
  console.log('  - /api/admin');
  console.log('  - /api/team');
  console.log('  - /api/pdmaster');
  console.log('  - /api/orders');
  console.log('  - /api/inventory');
  console.log('  - /api/departments');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  console.error('Stack:', error.stack);
  // Don't exit - let server start with basic routes
}

// Health check endpoint (must respond quickly for Render)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    message: 'Sonalika Backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Home route
app.get('/', (req, res) => {
  res.send('Sonalika Backend is working! 🚀');
});

// Express handles 404s automatically - no need for app.all('*')

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: err.message 
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  console.log(`✅ Health check available at /health`);
  console.log(`✅ Routes available at /api/*`);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// For Vercel deployments (optional)
module.exports = app;