/**
 * Script per aggiornare i servizi esistenti con la proprietà isEU
 * Questo script identifica i paesi EU e setta il flag isEU sui servizi internazionali
 */
const mongoose = require('mongoose');
const { loadModel } = require('../utils/modelLoader');
require('dotenv').config();  // Carica le variabili d'ambiente

// Carica i modelli
const Service = loadModel('Service');

// Elenco di codici paesi EU
const EU_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
                      'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
                      'SI', 'ES', 'SE'];

// Connessione a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipping_rates';

mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('Connesso a MongoDB');
  updateServices();
})
.catch(err => {
  console.error('Errore nella connessione a MongoDB:', err);
  process.exit(1);
});

async function updateServices() {
  try {
    // Ottiene tutti i servizi internazionali
    const services = await Service.find({ destinationType: 'international' });
    console.log(`Trovati ${services.length} servizi internazionali`);
    
    let updatedCount = 0;
    
    // Aggiorna ciascun servizio
    for (const service of services) {
      if (service.destinationCountry) {
        // Alcuni servizi hanno più paesi separati da virgole e spazi
        const countries = service.destinationCountry.split(/,\s*/);
        let isEU = false;
        
        // Controlla se almeno uno dei paesi è in UE
        for (const country of countries) {
          const countryCode = country.trim().toUpperCase();
          if (EU_COUNTRIES.includes(countryCode)) {
            isEU = true;
            break;
          }
        }
        
        // Aggiorna il servizio
        await Service.findByIdAndUpdate(service._id, { isEU });
        
        console.log(`Servizio ${service.name} (${service.destinationCountry}): isEU = ${isEU}`);
        updatedCount++;
      } else {
        console.log(`Servizio ${service.name}: Nessun paese di destinazione specificato`);
      }
    }
    
    console.log(`Aggiornamento completato. ${updatedCount} servizi aggiornati.`);
    process.exit(0);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei servizi:', error);
    process.exit(1);
  }
} 