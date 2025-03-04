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

// Dati di esempio
const carriers = [
  {
    name: 'BRT',
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
        destinationTypes: ['national', 'eu'],
        pricing: [
          {
            destinationType: 'national',
            pricePerKg: 4.80
          },
          {
            destinationType: 'eu',
            pricePerKg: 9.50
          }
        ]
      },
      {
        name: 'BRT Economy',
        code: 'BRT_ECONOMY',
        description: 'Consegna economica in 48-72h',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            pricePerKg: 3.50
          },
          {
            destinationType: 'eu',
            pricePerKg: 7.80
          },
          {
            destinationType: 'extra_eu',
            pricePerKg: 15.20
          }
        ]
      }
    ]
  },
  {
    name: 'DHL',
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
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            pricePerKg: 5.20
          },
          {
            destinationType: 'eu',
            pricePerKg: 10.80
          },
          {
            destinationType: 'extra_eu',
            pricePerKg: 22.50
          }
        ]
      },
      {
        name: 'DHL Economy',
        code: 'DHL_ECONOMY',
        description: 'Consegna economica in 48-72h',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            pricePerKg: 4.10
          },
          {
            destinationType: 'eu',
            pricePerKg: 8.90
          },
          {
            destinationType: 'extra_eu',
            pricePerKg: 18.70
          }
        ]
      }
    ]
  },
  {
    name: 'GLS',
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
        destinationTypes: ['national', 'eu'],
        pricing: [
          {
            destinationType: 'national',
            pricePerKg: 4.30
          },
          {
            destinationType: 'eu',
            pricePerKg: 9.20
          }
        ]
      },
      {
        name: 'GLS Standard',
        code: 'GLS_STANDARD',
        description: 'Consegna standard in 48h',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu'],
        pricing: [
          {
            destinationType: 'national',
            pricePerKg: 3.40
          },
          {
            destinationType: 'eu',
            pricePerKg: 7.50
          }
        ]
      }
    ]
  }
];

const weights = [0.5, 1, 2, 3, 5, 10, 15, 20, 30];

// Funzione per generare le tariffe
async function generateRates(carriersData) {
  const rates = [];
  
  for (const carrier of carriersData) {
    for (const service of carrier.services) {
      for (const pricing of service.pricing) {
        for (const weight of weights) {
          // Calcolo prezzo base in base al peso
          const basePrice = parseFloat((pricing.pricePerKg * weight).toFixed(2));
          
          // Prezzo di acquisto (80% del prezzo base)
          const purchasePrice = parseFloat((basePrice * 0.8).toFixed(2));
          
          // Prezzo di vendita (prezzo base + fuel surcharge)
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
            destinationType: pricing.destinationType,
            deliveryTimeMin: service.deliveryTimeMin,
            deliveryTimeMax: service.deliveryTimeMax,
            active: true,
            destinationCountry: pricing.countryCode || null
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
    // Verifica se ci sono già dati nel database
    const existingCarriers = await Carrier.countDocuments();
    
    if (existingCarriers > 0) {
      console.log('Ci sono già dati nel database. Vuoi sovrascriverli? (Y/N)');
      // Qui dovresti avere un'interazione con l'utente, ma per semplicità forziamo l'eliminazione
      console.log('Procedo con la pulizia e il reseeding del database...');
    }
    
    // Elimina i dati esistenti
    await Carrier.deleteMany({});
    await Rate.deleteMany({});
    await Suggestion.deleteMany({});
    
    console.log('Database ripulito');
    
    // Inserisci i carrier
    const createdCarriers = await Carrier.insertMany(carriers);
    console.log(`Inseriti ${createdCarriers.length} carrier`);
    
    // Genera e inserisci le tariffe
    const rates = await generateRates(createdCarriers);
    
    // Dividi le tariffe in batch se sono troppe per evitare errori di memoria
    const batchSize = 100;
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