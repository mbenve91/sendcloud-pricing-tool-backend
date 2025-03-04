const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente
dotenv.config();

// Importa i middleware
const corsMiddleware = require('./middleware/cors');

// Importa le routes
const carrierRoutes = require('./routes/carriers');
const rateRoutes = require('./routes/rates');
const suggestionRoutes = require('./routes/suggestions');

// Inizializza l'app Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connesso a MongoDB');
  })
  .catch(err => {
    console.error('Errore di connessione a MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/carriers', carrierRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/suggestions', suggestionRoutes);

// Route di base
app.get('/', (req, res) => {
  res.send('API di Sendcloud Pricing Tool');
});

// Gestione delle route non trovate
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Endpoint non trovato'
  });
});

// Gestione errori generica
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Si è verificato un errore nel server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
}); 