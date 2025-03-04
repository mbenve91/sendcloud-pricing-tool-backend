const cors = require('cors');

// Configura il middleware CORS
const corsOptions = {
  // Origine consentita (il frontend)
  origin: (origin, callback) => {
    // Consenti richieste senza origine (come app mobile o curl)
    if (!origin) return callback(null, true);
    
    // Lista delle origini consentite statiche
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5050',
      'https://sendcloud-pricing-tool.vercel.app'
    ];
    
    // Verifica se l'origine è nella lista statica
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Verifica se l'origine è un dominio Vercel
    if (origin.match(/^https:\/\/[a-z0-9-]+\.vercel\.app$/i)) {
      return callback(null, true);
    }
    
    // In sviluppo, accetta tutte le origini
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Altrimenti, blocca la richiesta
    callback(new Error('Non consentito dal CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

module.exports = cors(corsOptions); 