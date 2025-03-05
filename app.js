// app.js - Express app configuration
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorMiddleware = require('./middleware/error');

// Import routes
const carrierRoutes = require('./routes/carriers');
const rateRoutes = require('./routes/rates');
const serviceRoutes = require('./routes/services');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// In produzione, accettiamo tutte le origini per evitare problemi CORS con i vari deploy di Vercel
app.use(cors({
  origin: true, // Accetta tutte le origini
  credentials: true
}));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/carriers', carrierRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/services', serviceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;