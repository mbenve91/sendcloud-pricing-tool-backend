/**
 * Script per verificare i servizi e le tariffe per Francia e Paesi Bassi
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
  const Carrier = loadModel('Carrier');
  
  // Cerca servizi per Francia e Paesi Bassi
  const services = await Service.find({
    $or: [
      { destinationCountry: { $regex: /FR/i } }, // Francia
      { destinationCountry: { $regex: /NL/i } }  // Paesi Bassi
    ]
  }).populate('carrier', 'name').select('name destinationType destinationCountry isEU carrier');
  
  console.log('=== SERVIZI PER FRANCIA E PAESI BASSI ===');
  console.log(JSON.stringify(services, null, 2));
  
  // Trova le tariffe per questi servizi
  if (services.length > 0) {
    const serviceIds = services.map(s => s._id);
    const rates = await Rate.find({
      service: { $in: serviceIds }
    }).populate({
      path: 'service',
      populate: {
        path: 'carrier',
        select: 'name logoUrl'
      }
    });
    
    console.log('=== TARIFFE PER QUESTI SERVIZI ===');
    console.log(JSON.stringify(rates.map(r => ({
      id: r._id,
      serviceId: r.service?._id,
      serviceName: r.service?.name,
      carrierName: r.service?.carrier?.name,
      destinationType: r.service?.destinationType,
      destinationCountry: r.service?.destinationCountry,
      weightMin: r.weightMin,
      weightMax: r.weightMax,
      retailPrice: r.retailPrice,
      purchasePrice: r.purchasePrice,
      margin: r.margin,
      marginPercentage: r.marginPercentage
    })), null, 2));

    // Verifica come i dati vengono passati al frontend
    console.log('\n=== SIMULAZIONE FORMATTAZIONE DATI PER FRONTEND ===');
    console.log('Verifico come i dati vengono formattati per il frontend:');
    
    // Esempio di come i dati potrebbero essere trasformati nel frontend
    rates.slice(0, 3).forEach(rate => {
      console.log('\nDati originali dal DB:');
      console.log(`- Servizio: ${rate.service?.name || 'N/A'}`);
      console.log(`- Corriere: ${rate.service?.carrier?.name || 'N/A'}`);
      console.log(`- Paese: ${rate.service?.destinationCountry || 'N/A'}`);
      console.log(`- Prezzo: ${rate.retailPrice || 'N/A'}`);
      
      console.log('\nPossibili problemi di formattazione:');
      console.log(`- Carrier undefined? ${!rate.service?.carrier ? 'Sì' : 'No'}`);
      console.log(`- Service undefined? ${!rate.service ? 'Sì' : 'No'}`);
      console.log(`- Nome del corriere mancante? ${!rate.service?.carrier?.name ? 'Sì' : 'No'}`);
      console.log(`- Paese mancante? ${!rate.service?.destinationCountry ? 'Sì' : 'No'}`);
    });
  }
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('Errore di connessione a MongoDB:', err);
}); 