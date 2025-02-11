const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configurazione CORS aggiornata
app.use(cors({
  origin: [
    'https://sendcloud-pricing-tool-frontend-hg2x.vercel.app',
    'http://localhost:3000',
    'https://sendcloud-pricing-tool-backend.onrender.com'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Access-Control-Allow-Origin'],
  optionsSuccessStatus: 204
}));

// Aggiungi middleware per gestire gli header CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://sendcloud-pricing-tool-frontend-hg2x.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

// Import routes
const carrierRoutes = require('./routes/carrierRoutes');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Use routes
app.use('/api/carriers', carrierRoutes);

// Aggiungi un log per debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Sendcloud Pricing Tool API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});