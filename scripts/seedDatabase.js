const mongoose = require('mongoose');
const Carrier = require('../models/carrier');
require('dotenv').config();

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sendcloud-tool')
  .then(() => console.log('Connesso a MongoDB per il seeding'))
  .catch(err => {
    console.error('Impossibile connettersi a MongoDB:', err);
    process.exit(1);
  });

// Dati di esempio per i corrieri
const carrierData = [
  {
    name: 'BRT',
    logoUrl: '/images/carriers/brt.png',
    isVolumetric: true,
    fuelSurcharge: 5.5,
    services: [
      {
        name: 'Express',
        code: 'BRT_EXPRESS',
        description: 'Consegna entro 24 ore in Italia',
        deliveryTimeMin: 24,
        deliveryTimeMax: 48,
        destinationTypes: ['national', 'eu'],
        pricing: [
          {
            destinationType: 'national',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 6.90, purchasePrice: 4.50, margin: 34.78 },
              { min: 1, max: 3, retailPrice: 8.90, purchasePrice: 5.80, margin: 34.83 },
              { min: 3, max: 5, retailPrice: 10.90, purchasePrice: 7.10, margin: 34.86 },
              { min: 5, max: 10, retailPrice: 13.90, purchasePrice: 9.00, margin: 35.25 },
              { min: 10, max: 20, retailPrice: 18.90, purchasePrice: 12.30, margin: 34.92 }
            ]
          },
          {
            destinationType: 'eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 12.90, purchasePrice: 8.40, margin: 34.88 },
              { min: 1, max: 3, retailPrice: 16.90, purchasePrice: 11.00, margin: 34.91 },
              { min: 3, max: 5, retailPrice: 21.90, purchasePrice: 14.20, margin: 35.16 },
              { min: 5, max: 10, retailPrice: 29.90, purchasePrice: 19.40, margin: 35.12 },
              { min: 10, max: 20, retailPrice: 39.90, purchasePrice: 25.90, margin: 35.09 }
            ]
          }
        ]
      },
      {
        name: 'Standard',
        code: 'BRT_STANDARD',
        description: 'Consegna entro 48 ore in Italia',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu'],
        pricing: [
          {
            destinationType: 'national',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 5.90, purchasePrice: 3.80, margin: 35.59 },
              { min: 1, max: 3, retailPrice: 7.90, purchasePrice: 5.10, margin: 35.44 },
              { min: 3, max: 5, retailPrice: 9.90, purchasePrice: 6.40, margin: 35.35 },
              { min: 5, max: 10, retailPrice: 12.90, purchasePrice: 8.40, margin: 34.88 },
              { min: 10, max: 20, retailPrice: 16.90, purchasePrice: 11.00, margin: 34.91 }
            ]
          },
          {
            destinationType: 'eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 10.90, purchasePrice: 7.10, margin: 34.86 },
              { min: 1, max: 3, retailPrice: 14.90, purchasePrice: 9.70, margin: 34.90 },
              { min: 3, max: 5, retailPrice: 19.90, purchasePrice: 12.90, margin: 35.18 },
              { min: 5, max: 10, retailPrice: 26.90, purchasePrice: 17.50, margin: 34.94 },
              { min: 10, max: 20, retailPrice: 35.90, purchasePrice: 23.30, margin: 35.10 }
            ]
          }
        ]
      }
    ],
    volumeDiscounts: [
      { minVolume: 100, maxVolume: 500, discountPercentage: 5, applicableServices: [] },
      { minVolume: 501, maxVolume: 1000, discountPercentage: 10, applicableServices: [] },
      { minVolume: 1001, discountPercentage: 15, applicableServices: [] }
    ],
    additionalFees: [
      { name: 'Consegna al piano', description: 'Consegna al piano specificato', fee: 5.00, applicableServices: [] },
      { name: 'Consegna il sabato', description: 'Consegna durante il sabato', fee: 7.50, applicableServices: [] }
    ],
    promotions: [
      { 
        name: 'Promo Estate', 
        description: 'Sconto estivo per nuovi clienti', 
        discountPercentage: 8, 
        startDate: new Date('2023-06-01'), 
        endDate: new Date('2023-08-31'), 
        applicableServices: [] 
      }
    ],
    isActive: true
  },
  {
    name: 'GLS',
    logoUrl: '/images/carriers/gls.png',
    isVolumetric: true,
    fuelSurcharge: 4.8,
    services: [
      {
        name: 'Express',
        code: 'GLS_EXPRESS',
        description: 'Consegna entro 24 ore in Italia',
        deliveryTimeMin: 24,
        deliveryTimeMax: 48,
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 6.50, purchasePrice: 4.20, margin: 35.38 },
              { min: 1, max: 3, retailPrice: 8.50, purchasePrice: 5.50, margin: 35.29 },
              { min: 3, max: 5, retailPrice: 10.50, purchasePrice: 6.80, margin: 35.24 },
              { min: 5, max: 10, retailPrice: 13.50, purchasePrice: 8.80, margin: 34.81 },
              { min: 10, max: 20, retailPrice: 18.50, purchasePrice: 12.00, margin: 35.14 }
            ]
          },
          {
            destinationType: 'eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 12.50, purchasePrice: 8.10, margin: 35.20 },
              { min: 1, max: 3, retailPrice: 16.50, purchasePrice: 10.70, margin: 35.15 },
              { min: 3, max: 5, retailPrice: 21.50, purchasePrice: 14.00, margin: 34.88 },
              { min: 5, max: 10, retailPrice: 29.50, purchasePrice: 19.20, margin: 34.92 },
              { min: 10, max: 20, retailPrice: 39.50, purchasePrice: 25.70, margin: 34.94 }
            ]
          },
          {
            destinationType: 'extra_eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 25.00, purchasePrice: 16.20, margin: 35.20 },
              { min: 1, max: 3, retailPrice: 35.00, purchasePrice: 22.80, margin: 34.86 },
              { min: 3, max: 5, retailPrice: 45.00, purchasePrice: 29.20, margin: 35.11 },
              { min: 5, max: 10, retailPrice: 65.00, purchasePrice: 42.20, margin: 35.08 },
              { min: 10, max: 20, retailPrice: 95.00, purchasePrice: 61.80, margin: 34.95 }
            ]
          }
        ]
      },
      {
        name: 'Standard',
        code: 'GLS_STANDARD',
        description: 'Consegna entro 48 ore in Italia',
        deliveryTimeMin: 48,
        deliveryTimeMax: 72,
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 5.50, purchasePrice: 3.60, margin: 34.55 },
              { min: 1, max: 3, retailPrice: 7.50, purchasePrice: 4.90, margin: 34.67 },
              { min: 3, max: 5, retailPrice: 9.50, purchasePrice: 6.20, margin: 34.74 },
              { min: 5, max: 10, retailPrice: 12.50, purchasePrice: 8.10, margin: 35.20 },
              { min: 10, max: 20, retailPrice: 16.50, purchasePrice: 10.70, margin: 35.15 }
            ]
          },
          {
            destinationType: 'eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 10.50, purchasePrice: 6.80, margin: 35.24 },
              { min: 1, max: 3, retailPrice: 14.50, purchasePrice: 9.40, margin: 35.17 },
              { min: 3, max: 5, retailPrice: 19.50, purchasePrice: 12.70, margin: 34.87 },
              { min: 5, max: 10, retailPrice: 26.50, purchasePrice: 17.20, margin: 35.09 },
              { min: 10, max: 20, retailPrice: 35.50, purchasePrice: 23.10, margin: 34.93 }
            ]
          },
          {
            destinationType: 'extra_eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 22.00, purchasePrice: 14.30, margin: 35.00 },
              { min: 1, max: 3, retailPrice: 32.00, purchasePrice: 20.80, margin: 35.00 },
              { min: 3, max: 5, retailPrice: 42.00, purchasePrice: 27.30, margin: 35.00 },
              { min: 5, max: 10, retailPrice: 60.00, purchasePrice: 39.00, margin: 35.00 },
              { min: 10, max: 20, retailPrice: 90.00, purchasePrice: 58.50, margin: 35.00 }
            ]
          }
        ]
      }
    ],
    volumeDiscounts: [
      { minVolume: 100, maxVolume: 500, discountPercentage: 6, applicableServices: [] },
      { minVolume: 501, maxVolume: 1000, discountPercentage: 12, applicableServices: [] },
      { minVolume: 1001, discountPercentage: 18, applicableServices: [] }
    ],
    additionalFees: [
      { name: 'Consegna al piano', description: 'Consegna al piano specificato', fee: 4.50, applicableServices: [] },
      { name: 'Consegna il sabato', description: 'Consegna durante il sabato', fee: 7.00, applicableServices: [] }
    ],
    promotions: [
      { 
        name: 'Promo Inverno', 
        description: 'Sconto invernale per nuovi clienti', 
        discountPercentage: 10, 
        startDate: new Date('2023-12-01'), 
        endDate: new Date('2024-02-28'), 
        applicableServices: [] 
      }
    ],
    isActive: true
  },
  {
    name: 'DHL',
    logoUrl: '/images/carriers/dhl.png',
    isVolumetric: true,
    fuelSurcharge: 6.2,
    services: [
      {
        name: 'Express',
        code: 'DHL_EXPRESS',
        description: 'Consegna entro 24 ore in Italia',
        deliveryTimeMin: 24,
        deliveryTimeMax: 48,
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 7.50, purchasePrice: 4.90, margin: 34.67 },
              { min: 1, max: 3, retailPrice: 9.50, purchasePrice: 6.20, margin: 34.74 },
              { min: 3, max: 5, retailPrice: 11.50, purchasePrice: 7.50, margin: 34.78 },
              { min: 5, max: 10, retailPrice: 14.50, purchasePrice: 9.40, margin: 35.17 },
              { min: 10, max: 20, retailPrice: 19.50, purchasePrice: 12.70, margin: 34.87 }
            ]
          },
          {
            destinationType: 'eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 13.50, purchasePrice: 8.80, margin: 34.81 },
              { min: 1, max: 3, retailPrice: 17.50, purchasePrice: 11.40, margin: 34.86 },
              { min: 3, max: 5, retailPrice: 22.50, purchasePrice: 14.60, margin: 35.11 },
              { min: 5, max: 10, retailPrice: 30.50, purchasePrice: 19.80, margin: 35.08 },
              { min: 10, max: 20, retailPrice: 40.50, purchasePrice: 26.30, margin: 35.06 }
            ]
          },
          {
            destinationType: 'extra_eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 26.00, purchasePrice: 16.90, margin: 35.00 },
              { min: 1, max: 3, retailPrice: 36.00, purchasePrice: 23.40, margin: 35.00 },
              { min: 3, max: 5, retailPrice: 46.00, purchasePrice: 29.90, margin: 35.00 },
              { min: 5, max: 10, retailPrice: 66.00, purchasePrice: 42.90, margin: 35.00 },
              { min: 10, max: 20, retailPrice: 96.00, purchasePrice: 62.40, margin: 35.00 }
            ]
          }
        ]
      },
      {
        name: 'Premium',
        code: 'DHL_PREMIUM',
        description: 'Consegna prioritaria entro 24 ore con garanzia',
        deliveryTimeMin: 24,
        deliveryTimeMax: 24,
        destinationTypes: ['national', 'eu', 'extra_eu'],
        pricing: [
          {
            destinationType: 'national',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 9.50, purchasePrice: 6.20, margin: 34.74 },
              { min: 1, max: 3, retailPrice: 11.50, purchasePrice: 7.50, margin: 34.78 },
              { min: 3, max: 5, retailPrice: 13.50, purchasePrice: 8.80, margin: 34.81 },
              { min: 5, max: 10, retailPrice: 16.50, purchasePrice: 10.70, margin: 35.15 },
              { min: 10, max: 20, retailPrice: 21.50, purchasePrice: 14.00, margin: 34.88 }
            ]
          },
          {
            destinationType: 'eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 15.50, purchasePrice: 10.10, margin: 34.84 },
              { min: 1, max: 3, retailPrice: 19.50, purchasePrice: 12.70, margin: 34.87 },
              { min: 3, max: 5, retailPrice: 24.50, purchasePrice: 15.90, margin: 35.10 },
              { min: 5, max: 10, retailPrice: 32.50, purchasePrice: 21.10, margin: 35.08 },
              { min: 10, max: 20, retailPrice: 42.50, purchasePrice: 27.60, margin: 35.06 }
            ]
          },
          {
            destinationType: 'extra_eu',
            weightRanges: [
              { min: 0, max: 1, retailPrice: 28.00, purchasePrice: 18.20, margin: 35.00 },
              { min: 1, max: 3, retailPrice: 38.00, purchasePrice: 24.70, margin: 35.00 },
              { min: 3, max: 5, retailPrice: 48.00, purchasePrice: 31.20, margin: 35.00 },
              { min: 5, max: 10, retailPrice: 68.00, purchasePrice: 44.20, margin: 35.00 },
              { min: 10, max: 20, retailPrice: 98.00, purchasePrice: 63.70, margin: 35.00 }
            ]
          }
        ]
      }
    ],
    volumeDiscounts: [
      { minVolume: 100, maxVolume: 500, discountPercentage: 7, applicableServices: [] },
      { minVolume: 501, maxVolume: 1000, discountPercentage: 14, applicableServices: [] },
      { minVolume: 1001, discountPercentage: 20, applicableServices: [] }
    ],
    additionalFees: [
      { name: 'Consegna al piano', description: 'Consegna al piano specificato', fee: 6.00, applicableServices: [] },
      { name: 'Consegna il sabato', description: 'Consegna durante il sabato', fee: 8.00, applicableServices: [] },
      { name: 'Assicurazione', description: 'Assicurazione aggiuntiva', fee: 5.00, applicableServices: [] }
    ],
    promotions: [
      { 
        name: 'Promo Primavera', 
        description: 'Sconto primaverile per nuovi clienti', 
        discountPercentage: 12, 
        startDate: new Date('2023-03-01'), 
        endDate: new Date('2023-05-31'), 
        applicableServices: [] 
      }
    ],
    isActive: true
  }
];

// Funzione per popolare il database
const seedDatabase = async () => {
  try {
    // Elimina tutti i dati esistenti
    await Carrier.deleteMany({});
    console.log('Database pulito');

    // Inserisci i nuovi dati
    await Carrier.insertMany(carrierData);
    console.log('Database popolato con successo');

    // Chiudi la connessione
    mongoose.connection.close();
  } catch (error) {
    console.error('Errore durante il seeding del database:', error);
    process.exit(1);
  }
};

// Esegui il seeding
seedDatabase(); 