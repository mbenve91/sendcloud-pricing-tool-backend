const cors = require('cors');

// Configura il middleware CORS
const corsOptions = {
  // Origine consentita (il frontend)
  origin: (origin, callback) => {
    // Consenti richieste senza origine (come app mobile o curl)
    if (!origin) return callback(null, true);
    
    // Lista delle origini consentite
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5050',
      'https://sendcloud-pricing-tool.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Non consentito dal CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

module.exports = cors(corsOptions); 