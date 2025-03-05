// server.js - Entry point for the application
require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const port = process.env.PORT || 5050;

// Funzione per avviare il server con gestione degli errori
const startServer = (attemptPort, attempts = 0) => {
  // Limita a max 10 tentativi e max porta 5060
  if (attempts >= 10 || attemptPort > 5060) {
    console.error('Impossibile trovare una porta disponibile dopo multipli tentativi');
    process.exit(1);
    return;
  }

  const server = app.listen(attemptPort, () => {
    console.log(`Server avviato sulla porta ${attemptPort}`);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`La porta ${attemptPort} è già in uso, provo con la porta ${attemptPort + 1}`);
      startServer(attemptPort + 1, attempts + 1);
    } else {
      console.error('Errore durante l\'avvio del server:', e);
    }
  });
};

// Avvia il server
startServer(port);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});