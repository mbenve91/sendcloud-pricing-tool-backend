// Script per popolare il database con dati di test
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Carrier = require('../models/carrier');
const Rate = require('../models/rate');
const Suggestion = require('../models/suggestion');

// Carica le variabili d'ambiente
dotenv.config();

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connesso a MongoDB per il seeding');
    seedData();
  })
  .catch(err => {
    console.error('Errore di connessione a MongoDB:', err.message);
    process.exit(1);
  });

// Dati di esempio semplificati per i carrier
const carriersData = [
  {
    name: 'BRT-Sendcloud',
    logoUrl: '/images/carriers/brt.png',
    isVolumetric: true,
    fuelSurcharge: 8.5,
    services: [
      {
        name: 'BRT Express',
        code: 'BRT_EXPRESS',
        description: 'Consegna express in 24h',
        deliveryTimeMin: 24,
        deliveryTimeMax: 48,
        destinationTypes: ['national', 'eu']
      },
      {
        name: 'BRT Economy',
        code: 'BRT_ECONOMY',
        description: 'Consegna economica in 48-72h',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu', 'extra_eu']
      }
    ]
  },
  {
    name: 'DHL-Sendcloud',
    logoUrl: '/images/carriers/dhl.png',
    isVolumetric: true,
    fuelSurcharge: 9.2,
    services: [
      {
        name: 'DHL Express',
        code: 'DHL_EXPRESS',
        description: 'Consegna express in 24h',
        deliveryTimeMin: 24,
        deliveryTimeMax: 36,
        destinationTypes: ['national', 'eu', 'extra_eu']
      },
      {
        name: 'DHL Economy',
        code: 'DHL_ECONOMY',
        description: 'Consegna economica in 48-72h',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu', 'extra_eu']
      }
    ]
  },
  {
    name: 'GLS-Sendcloud',
    logoUrl: '/images/carriers/gls.png',
    isVolumetric: true,
    fuelSurcharge: 7.8,
    services: [
      {
        name: 'GLS Express',
        code: 'GLS_EXPRESS',
        description: 'Consegna express in 24h',
        deliveryTimeMin: 24,
        deliveryTimeMax: 48,
        destinationTypes: ['national', 'eu']
      },
      {
        name: 'GLS Standard',
        code: 'GLS_STANDARD',
        description: 'Consegna standard in 48h',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu']
      }
    ]
  }
];

// Pesi per le tariffe
const weights = [0.5, 1, 2, 3, 5, 10, 15, 20, 30];

// Prezzi di base per destinazione e servizio
const basePrices = {
  'national': {
    'EXPRESS': 5.20,
    'ECONOMY': 3.80,
    'STANDARD': 4.10
  },
  'eu': {
    'EXPRESS': 10.50,
    'ECONOMY': 8.20,
    'STANDARD': 9.30
  },
  'extra_eu': {
    'EXPRESS': 22.00,
    'ECONOMY': 18.50,
    'STANDARD': 20.00
  }
};

// Funzione per generare le tariffe
function generateRates(carriers) {
  const rates = [];
  
  for (const carrier of carriers) {
    for (const service of carrier.services) {
      for (const destinationType of service.destinationTypes) {
        for (const weight of weights) {
          // Determina il tipo di servizio (EXPRESS, ECONOMY o STANDARD)
          let serviceType = 'STANDARD';
          if (service.code.includes('EXPRESS')) {
            serviceType = 'EXPRESS';
          } else if (service.code.includes('ECONOMY')) {
            serviceType = 'ECONOMY';
          }
          
          // Ottieni il prezzo base per questo tipo di servizio e destinazione
          const pricePerKg = basePrices[destinationType][serviceType] || 5.0;
          
          // Calcola i prezzi (usando parseFloat e toFixed per evitare NaN)
          const basePrice = parseFloat((pricePerKg * weight).toFixed(2));
          const purchasePrice = parseFloat((basePrice * 0.8).toFixed(2));
          const sellingPrice = parseFloat((basePrice * (1 + carrier.fuelSurcharge / 100)).toFixed(2));
          
          rates.push({
            carrierId: carrier._id,
            serviceCode: service.code,
            serviceName: service.name,
            basePrice: basePrice,
            fuelSurcharge: carrier.fuelSurcharge,
            volumeDiscount: 0,
            promotionDiscount: 0,
            purchasePrice: purchasePrice,
            sellingPrice: sellingPrice,
            marginDiscount: 0,
            weight: weight,
            destinationType: destinationType,
            deliveryTimeMin: service.deliveryTimeMin,
            deliveryTimeMax: service.deliveryTimeMax,
            active: true
          });
        }
      }
    }
  }
  
  return rates;
}

// Funzione per generare suggerimenti
function generateSuggestions(carriers) {
  const suggestions = [
    {
      type: 'price_optimization',
      carrierId: carriers[0]._id,
      message: 'Abbassare il prezzo del 5% per il servizio Express potrebbe aumentare il volume di ordini del 15%',
      details: {
        serviceCode: 'BRT_EXPRESS',
        currentPricePerKg: 4.80,
        suggestedPricePerKg: 4.56,
        estimatedVolumeIncrease: 15
      },
      priority: 1
    },
    {
      type: 'cross_sell',
      carrierId: carriers[1]._id,
      message: 'I clienti che utilizzano DHL Express hanno il 70% di probabilità di utilizzare anche il servizio di imballaggio premium',
      details: {
        serviceCode: 'DHL_EXPRESS',
        relatedService: 'Premium Packaging',
        conversionRate: 70
      },
      priority: 2
    },
    {
      type: 'retention',
      carrierId: carriers[2]._id,
      message: "Offrire uno sconto del 10% ai clienti che hanno ridotto l'utilizzo di GLS nell'ultimo trimestre",
      details: {
        targetCustomers: 'decreasing_usage',
        discountPercentage: 10,
        estimatedRetention: 65
      },
      priority: 1
    }
  ];
  
  return suggestions;
}

// Funzione per popolare il database
async function seedData() {
  try {
    // Elimina i dati esistenti
    await Carrier.deleteMany({});
    await Rate.deleteMany({});
    await Suggestion.deleteMany({});
    
    console.log('Database ripulito');
    
    // Inserisci i carrier
    const createdCarriers = await Carrier.insertMany(carriersData);
    console.log(`Inseriti ${createdCarriers.length} carrier`);
    
    // Genera e inserisci le tariffe
    const rates = generateRates(createdCarriers);
    
    // Dividi le tariffe in batch
    const batchSize = 50;
    for (let i = 0; i < rates.length; i += batchSize) {
      const batch = rates.slice(i, i + batchSize);
      await Rate.insertMany(batch);
      console.log(`Inserite ${batch.length} tariffe (${i + batch.length}/${rates.length})`);
    }
    
    // Genera e inserisci i suggerimenti
    const suggestions = generateSuggestions(createdCarriers);
    await Suggestion.insertMany(suggestions);
    console.log(`Inseriti ${suggestions.length} suggerimenti`);
    
    console.log('Seeding completato con successo');
    
    // Chiudi la connessione
    mongoose.connection.close();
  } catch (err) {
    console.error('Errore durante il seeding:', err);
    mongoose.connection.close();
  }
}

// Esporta la funzione per poterla utilizzare da command line
module.exports = seedData; 