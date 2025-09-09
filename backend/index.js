const express = require('express');
require('dotenv').config();
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection (using URI from .env)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Load allowed origins from .env and split into an array
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sonalika.vercel.app',
  'https://sonalika.onrender.com'
];

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided - allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
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
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const pteamRoutes = require('./routes/pteamRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/pdmaster', pteamRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sonalika Backend is running',
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
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});

// For Vercel deployments (optional)
module.exports = app;