/**
 * Script per verificare la struttura dei dati nel database
 * Mostra i servizi e le tariffe con i loro attributi di filtro
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { loadModel } = require('../utils/modelLoader');

// Connessione a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipping_rates';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  console.log('Connesso a MongoDB');
  
  // Carica i modelli
  const Service = loadModel('Service');
  const Rate = loadModel('Rate');
  
  // Controlla i servizi disponibili
  const services = await Service.find().select('name destinationType destinationCountry isEU');
  console.log('=== SERVIZI ===');
  console.log(JSON.stringify(services, null, 2));
  
  // Controlla le tariffe disponibili
  const rates = await Rate.find().populate('service', 'name destinationType destinationCountry isEU');
  console.log('=== TARIFFE ===');
  console.log(JSON.stringify(rates.map(r => ({ 
    id: r._id,
    serviceId: r.service?._id,
    serviceName: r.service?.name,
    destinationType: r.service?.destinationType,
    destinationCountry: r.service?.destinationCountry,
    isEU: r.service?.isEU
  })), null, 2));
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('Errore di connessione a MongoDB:', err);
}); 