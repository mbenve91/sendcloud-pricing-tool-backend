// Importa l'applicazione Express da app.js
const app = require('./app');

// Avvia il server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});

// Questo file serve solo come punto di ingresso per Render 