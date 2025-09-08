const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const pteamRoutes = require('./routes/pteamRoutes');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Connect MongoDB
connectDB();
app.use(express.json());
// Increase payload size limit for file uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// CORS Configuration


app.use(cors({
  origin: 'ALLOWED_ORIGINS',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// CORS middleware will handle preflight requests automatically

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

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/pdmaster', pteamRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: err.message 
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});











// const express = require('express');
// const session = require('express-session');
// const connectDB = require('./config/db');
// const adminRoutes = require('./routes/adminRoutes');
// const userRoutes =require('./routes/userRoutes')
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// connectDB();

// app.use(cors({
//   origin: 'ALLOWED_ORIGINS',
//   credentials: true
// }));
// app.use(express.json());

// app.use(session({
//   secret: 'yourSecretKey',
//   resave: false,
//   saveUninitialized: false
// }));

// app.use('/api/admin', adminRoutes);
// app.use('/api/user',userRoutes);

// // ====== START THE SERVER IN SAME FILE ======
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
