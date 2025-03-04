const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente
dotenv.config();

// Definizione dello schema Carrier direttamente in questo file
const carrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logoUrl: {
    type: String,
    default: '/images/carriers/default.png'
  },
  isVolumetric: {
    type: Boolean,
    required: true
  },
  fuelSurcharge: {
    type: Number,
    default: 0
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    deliveryTimeMin: {
      type: Number  // in hours
    },
    deliveryTimeMax: {
      type: Number  // in hours
    },
    destinationTypes: [{
      type: String,
      enum: ['national', 'eu', 'extra_eu'],
      required: true
    }]
  }]
});

// Definizione dello schema Rate direttamente in questo file
const rateSchema = new mongoose.Schema({
  carrierId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  serviceCode: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  fuelSurcharge: {
    type: Number,
    default: 0
  },
  volumeDiscount: {
    type: Number,
    default: 0
  },
  promotionDiscount: {
    type: Number,
    default: 0
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  marginDiscount: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    required: true
  },
  destinationType: {
    type: String,
    enum: ['national', 'eu', 'extra_eu'],
    required: true
  },
  deliveryTimeMin: {
    type: Number
  },
  deliveryTimeMax: {
    type: Number
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Definizione dello schema Suggestion direttamente in questo file
const suggestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['price_optimization', 'cross_sell', 'upsell', 'retention', 'custom'],
    required: true
  },
  carrierId: {
    type: mongoose.Schema.Types.ObjectId
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  applied: {
    type: Boolean,
    default: false
  },
  dismissed: {
    type: Boolean,
    default: false
  }
});

// Creazione dei modelli
const Carrier = mongoose.model('Carrier', carrierSchema);
const Rate = mongoose.model('Rate', rateSchema);
const Suggestion = mongoose.model('Suggestion', suggestionSchema);

// Dati di esempio per i carrier
const carriersData = [
  {
    name: 'BRT-Final',
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
    name: 'DHL-Final',
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
      }
    ]
  }
];

// Pesi predefiniti
const weights = [1, 2, 5, 10];

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
  if (carriers.length < 2) return [];
  
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
    }
  ];
  
  return suggestions;
}

// Funzione principale di seeding
async function seedData() {
  let connection;
  
  try {
    // Connessione al database
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connesso a MongoDB');
    
    // Elimina i dati esistenti
    await Carrier.deleteMany({});
    await Rate.deleteMany({});
    await Suggestion.deleteMany({});
    console.log('Database ripulito');
    
    // Inserisci i carrier
    const createdCarriers = await Carrier.insertMany(carriersData);
    console.log(`Inseriti ${createdCarriers.length} carrier`);
    
    // Genera le tariffe
    const rates = generateRates(createdCarriers);
    
    // Inserisci le tariffe in batch
    const batchSize = 20;
    let insertedRates = 0;
    
    for (let i = 0; i < rates.length; i += batchSize) {
      const batch = rates.slice(i, i + batchSize);
      await Rate.insertMany(batch);
      insertedRates += batch.length;
      console.log(`Inserite ${insertedRates}/${rates.length} tariffe`);
    }
    
    // Genera e inserisci i suggerimenti
    const suggestions = generateSuggestions(createdCarriers);
    if (suggestions.length > 0) {
      await Suggestion.insertMany(suggestions);
      console.log(`Inseriti ${suggestions.length} suggerimenti`);
    } else {
      console.log('Nessun suggerimento inserito');
    }
    
    console.log('Seeding completato con successo');
  } catch (err) {
    console.error('Errore durante il seeding:', err);
  } finally {
    // Chiudi la connessione nel blocco finally
    if (connection) {
      await mongoose.disconnect();
      console.log('Connessione al database chiusa');
    }
  }
}

// Esegui il seeding
seedData(); 