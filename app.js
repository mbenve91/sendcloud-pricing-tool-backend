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

// Configurazione CORS per accettare TUTTE le origini senza alcuna restrizione
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Gestisci le richieste OPTIONS per il preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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