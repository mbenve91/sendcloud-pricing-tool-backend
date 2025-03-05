/**
 * Script per popolare direttamente il database MongoDB con i dati dei corrieri
 * Utilizza i modelli Mongoose a tre livelli: Carrier, Service, Rate
 * 
 * Questo script inserisce direttamente i dati estratti dai CSV senza richiedere i file originali.
 */
const mongoose = require('mongoose');
const { loadModel } = require('../utils/modelLoader');
const Carrier = loadModel('Carrier');
const Service = loadModel('Service');
const Rate = loadModel('Rate');

// Connessione a MongoDB
mongoose.connect('mongodb://localhost:27017/shipping_rates', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Definizione dei corrieri
const carriers = [
  {
    name: 'BRT',
    logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/brt.svg-P9qauJfDY2jf3ssHnMivYtBnNz8wSn.png',
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    name: 'GLS',
    logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gls-RAOsrs0wCzdXlD2OvgPbVa7qqFDgOo.webp',
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    name: 'DHL',
    logoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dhl-19ZkH6nuiU7ABE42HthHDOQWjmOWqU.webp',
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    name: 'Poste Italiane',
    logoUrl: '/placeholder.svg?height=40&width=40',
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    name: 'InPost',
    logoUrl: '/placeholder.svg?height=40&width=40',
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  },
  {
    name: 'FedEx',
    logoUrl: '/placeholder.svg?height=40&width=40',
    isActive: true,
    fuelSurcharge: 0,
    isVolumetric: false
  }
];

// Definizione dei servizi BRT con le relative tariffe
const brtServices = [
  {
    name: 'BRT Express',
    code: 'brt_express',
    description: 'Servizio espresso BRT per consegna nazionale',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 4.49, retailPrice: 5.50 },
      { weightMin: 2, weightMax: 5, purchasePrice: 4.79, retailPrice: 5.80 },
      { weightMin: 5, weightMax: 10, purchasePrice: 7.18, retailPrice: 8.19 },
      { weightMin: 10, weightMax: 25, purchasePrice: 10.35, retailPrice: 11.36 },
      { weightMin: 25, weightMax: 50, purchasePrice: 16.16, retailPrice: 18.18 }
    ]
  },
  {
    name: 'BRT Express to PUDO',
    code: 'brt_express_pudo',
    description: 'Servizio espresso BRT per consegna a punto di ritiro',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 3.84, retailPrice: 4.85 },
      { weightMin: 2, weightMax: 5, purchasePrice: 4.09, retailPrice: 5.10 },
      { weightMin: 5, weightMax: 10, purchasePrice: 5.91, retailPrice: 6.99 },
      { weightMin: 10, weightMax: 20, purchasePrice: 8.52, retailPrice: 9.99 }
    ]
  },
  {
    name: 'BRT Return from Shop',
    code: 'brt_return_shop',
    description: 'Servizio di ritiro BRT da punto vendita',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 3.84, retailPrice: 4.85 },
      { weightMin: 2, weightMax: 5, purchasePrice: 4.09, retailPrice: 5.10 },
      { weightMin: 5, weightMax: 10, purchasePrice: 5.98, retailPrice: 6.99 }
    ]
  },
  {
    name: 'BRT Express 12:00',
    code: 'brt_express_12',
    description: 'Servizio espresso BRT per consegna entro le 12:00',
    deliveryTimeMin: 12,
    deliveryTimeMax: 24,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 6.73, retailPrice: 8.42 },
      { weightMin: 2, weightMax: 5, purchasePrice: 7.19, retailPrice: 8.99 },
      { weightMin: 5, weightMax: 10, purchasePrice: 10.77, retailPrice: 13.46 },
      { weightMin: 10, weightMax: 25, purchasePrice: 15.53, retailPrice: 19.41 }
    ]
  },
  {
    name: 'BRT Express 10:30',
    code: 'brt_express_1030',
    description: 'Servizio espresso BRT per consegna entro le 10:30',
    deliveryTimeMin: 12,
    deliveryTimeMax: 24,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 8.98, retailPrice: 11.22 },
      { weightMin: 2, weightMax: 5, purchasePrice: 9.58, retailPrice: 11.98 },
      { weightMin: 5, weightMax: 10, purchasePrice: 14.36, retailPrice: 17.95 },
      { weightMin: 10, weightMax: 25, purchasePrice: 20.70, retailPrice: 25.88 }
    ]
  }
];

// Definizione dei servizi DHL con le relative tariffe
const dhlServices = [
  {
    name: 'DHL Express Domestic',
    code: 'dhl_express_domestic',
    description: 'Servizio espresso DHL per consegna nazionale',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 3, purchasePrice: 8.32, retailPrice: 10.40 },
      { weightMin: 3, weightMax: 5, purchasePrice: 10.16, retailPrice: 12.70 },
      { weightMin: 5, weightMax: 10, purchasePrice: 11.49, retailPrice: 14.36 },
      { weightMin: 10, weightMax: 20, purchasePrice: 17.04, retailPrice: 21.30 },
      { weightMin: 20, weightMax: 30, purchasePrice: 21.37, retailPrice: 26.71 },
      { weightMin: 30, weightMax: 40, purchasePrice: 35.77, retailPrice: 44.71 },
      { weightMin: 40, weightMax: 50, purchasePrice: 50.17, retailPrice: 62.71 },
      { weightMin: 50, weightMax: 60, purchasePrice: 64.57, retailPrice: 80.71 },
      { weightMin: 60, weightMax: 70, purchasePrice: 78.97, retailPrice: 98.71 }
    ]
  }
];

// Definizione dei servizi GLS con le relative tariffe
const glsServices = [
  {
    name: 'GLS National Express',
    code: 'gls_national_express',
    description: 'Servizio espresso GLS per consegna nazionale',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 4.20, retailPrice: 5.04 },
      { weightMin: 2, weightMax: 5, purchasePrice: 4.60, retailPrice: 5.51 },
      { weightMin: 5, weightMax: 10, purchasePrice: 6.50, retailPrice: 7.73 },
      { weightMin: 10, weightMax: 30, purchasePrice: 12.00, retailPrice: 17.14 },
      { weightMin: 30, weightMax: 50, purchasePrice: 17.00, retailPrice: 24.29 },
      { weightMin: 50, weightMax: 100, purchasePrice: 30.00, retailPrice: 42.86 }
    ]
  },
  {
    name: 'GLS National Express - FlexDeliveryService',
    code: 'gls_national_express_flex',
    description: 'Servizio espresso GLS con consegna flessibile',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 4.20, retailPrice: 5.04 },
      { weightMin: 2, weightMax: 5, purchasePrice: 4.60, retailPrice: 5.51 },
      { weightMin: 5, weightMax: 10, purchasePrice: 6.50, retailPrice: 7.73 },
      { weightMin: 10, weightMax: 30, purchasePrice: 12.00, retailPrice: 17.14 }
    ]
  },
  {
    name: 'GLS ShopReturn Service',
    code: 'gls_shopreturn',
    description: 'Servizio di ritiro GLS da punto vendita',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 3.50, retailPrice: 4.20 },
      { weightMin: 2, weightMax: 5, purchasePrice: 3.50, retailPrice: 4.20 },
      { weightMin: 5, weightMax: 10, purchasePrice: 4.00, retailPrice: 4.80 },
      { weightMin: 10, weightMax: 20, purchasePrice: 8.00, retailPrice: 9.60 }
    ]
  }
];

// Definizione dei servizi InPost con le relative tariffe
const inpostServices = [
  {
    name: 'InPost Locker to Locker Small',
    code: 'inpost_locker_to_locker_small',
    description: 'Servizio InPost da locker a locker, formato piccolo',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 2.89, retailPrice: 3.61 }
    ]
  },
  {
    name: 'InPost Locker to Locker Medium',
    code: 'inpost_locker_to_locker_medium',
    description: 'Servizio InPost da locker a locker, formato medio',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 2.99, retailPrice: 3.74 }
    ]
  },
  {
    name: 'InPost Locker to Locker Large',
    code: 'inpost_locker_to_locker_large',
    description: 'Servizio InPost da locker a locker, formato grande',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 3.19, retailPrice: 3.99 }
    ]
  },
  {
    name: 'InPost Address to Locker Small',
    code: 'inpost_address_to_locker_small',
    description: 'Servizio InPost da indirizzo a locker, formato piccolo',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 2.95, retailPrice: 3.93 }
    ]
  },
  {
    name: 'InPost Address to Locker Medium',
    code: 'inpost_address_to_locker_medium',
    description: 'Servizio InPost da indirizzo a locker, formato medio',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 3.20, retailPrice: 4.27 }
    ]
  },
  {
    name: 'InPost Address to Locker Large',
    code: 'inpost_address_to_locker_large',
    description: 'Servizio InPost da indirizzo a locker, formato grande',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 3.45, retailPrice: 4.60 }
    ]
  },
  {
    name: 'InPost Returns Small',
    code: 'inpost_returns_small',
    description: 'Servizio di reso InPost, formato piccolo',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 3.59, retailPrice: 4.79 }
    ]
  },
  {
    name: 'InPost Returns Medium',
    code: 'inpost_returns_medium',
    description: 'Servizio di reso InPost, formato medio',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 3.89, retailPrice: 5.19 }
    ]
  },
  {
    name: 'InPost Returns Large',
    code: 'inpost_returns_large',
    description: 'Servizio di reso InPost, formato grande',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 25, purchasePrice: 4.19, retailPrice: 5.59 }
    ]
  }
];

// Definizione dei servizi Poste Italiane con le relative tariffe
const posteServices = [
  {
    name: 'Poste Delivery Business Standard Domicilio',
    code: 'poste_delivery_business_standard_domicilio',
    description: 'Servizio standard di Poste Italiane per consegna a domicilio',
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 4.60, retailPrice: 5.49 },
      { weightMin: 2, weightMax: 5, purchasePrice: 5.30, retailPrice: 6.29 },
      { weightMin: 5, weightMax: 10, purchasePrice: 6.90, retailPrice: 7.99 },
      { weightMin: 10, weightMax: 20, purchasePrice: 8.10, retailPrice: 9.60 },
      { weightMin: 20, weightMax: 30, purchasePrice: 10.00, retailPrice: 11.85 },
      { weightMin: 30, weightMax: 50, purchasePrice: 30.00, retailPrice: 45.99 },
      { weightMin: 50, weightMax: 70, purchasePrice: 30.00, retailPrice: 50.99 }
    ]
  },
  {
    name: 'Poste Delivery Business Express Domicilio',
    code: 'poste_delivery_business_express_domicilio',
    description: 'Servizio espresso di Poste Italiane per consegna a domicilio',
    deliveryTimeMin: 24,
    deliveryTimeMax: 48,
    destinationType: 'national',
    destinationCountry: 'IT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 2, purchasePrice: 5.90, retailPrice: 7.08 },
      { weightMin: 2, weightMax: 5, purchasePrice: 6.70, retailPrice: 8.04 },
      { weightMin: 5, weightMax: 10, purchasePrice: 8.00, retailPrice: 9.60 },
      { weightMin: 10, weightMax: 20, purchasePrice: 10.50, retailPrice: 12.60 },
      { weightMin: 20, weightMax: 30, purchasePrice: 15.00, retailPrice: 18.00 }
    ]
  }
];

// Definizione dei servizi FedEx con le relative tariffe per Paesi EU
const fedexServices = [
  // Germania e Francia
  {
    name: 'FedEx International Connect Plus',
    code: 'fedex_international_connect_plus_de_fr',
    description: 'Servizio internazionale FedEx per Germania e Francia',
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    destinationType: 'international',
    destinationCountry: 'DE, FR',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 0.5, purchasePrice: 8.82, retailPrice: 13.57 },
      { weightMin: 0.5, weightMax: 2.5, purchasePrice: 10.24, retailPrice: 15.75 },
      { weightMin: 2.5, weightMax: 5, purchasePrice: 15.94, retailPrice: 24.52 },
      { weightMin: 5, weightMax: 10, purchasePrice: 18.78, retailPrice: 28.89 },
      { weightMin: 10, weightMax: 20, purchasePrice: 26.50, retailPrice: 40.77 },
      { weightMin: 20, weightMax: 20.5, purchasePrice: 32.75, retailPrice: 50.38 },
      { weightMin: 20.5, weightMax: 32, purchasePrice: 41.79, retailPrice: 64.29 },
      { weightMin: 32, weightMax: 32.5, purchasePrice: 54.57, retailPrice: 83.95 }
    ]
  },
  // Belgio, Spagna, Paesi Bassi
  {
    name: 'FedEx International Connect Plus',
    code: 'fedex_international_connect_plus_be_es_nl',
    description: 'Servizio internazionale FedEx per Belgio, Spagna e Paesi Bassi',
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    destinationType: 'international',
    destinationCountry: 'BE, ES, NL',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 0.5, purchasePrice: 9.52, retailPrice: 14.65 },
      { weightMin: 0.5, weightMax: 2.5, purchasePrice: 11.19, retailPrice: 17.22 },
      { weightMin: 2.5, weightMax: 5, purchasePrice: 18.99, retailPrice: 29.22 },
      { weightMin: 5, weightMax: 10, purchasePrice: 21.76, retailPrice: 33.48 },
      { weightMin: 10, weightMax: 20, purchasePrice: 32.59, retailPrice: 50.14 },
      { weightMin: 20, weightMax: 20.5, purchasePrice: 39.28, retailPrice: 60.43 }
    ]
  },
  // Lussemburgo, Portogallo
  {
    name: 'FedEx International Connect Plus',
    code: 'fedex_international_connect_plus_lu_pt',
    description: 'Servizio internazionale FedEx per Lussemburgo e Portogallo',
    deliveryTimeMin: 48,
    deliveryTimeMax: 72,
    destinationType: 'international',
    destinationCountry: 'LU, PT',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 0.5, purchasePrice: 10.12, retailPrice: 15.57 },
      { weightMin: 0.5, weightMax: 2.5, purchasePrice: 12.01, retailPrice: 18.48 },
      { weightMin: 2.5, weightMax: 5, purchasePrice: 20.63, retailPrice: 31.74 },
      { weightMin: 5, weightMax: 10, purchasePrice: 23.18, retailPrice: 35.66 }
    ]
  },
  // Regno Unito
  {
    name: 'FedEx International Connect Plus',
    code: 'fedex_international_connect_plus_gb',
    description: 'Servizio internazionale FedEx per Regno Unito',
    deliveryTimeMin: 48,
    deliveryTimeMax: 96,
    destinationType: 'international',
    destinationCountry: 'GB',
    isActive: true,
    rates: [
      { weightMin: 0, weightMax: 0.5, purchasePrice: 13.29, retailPrice: 20.45 },
      { weightMin: 0.5, weightMax: 2.5, purchasePrice: 15.38, retailPrice: 23.66 },
      { weightMin: 2.5, weightMax: 5, purchasePrice: 21.88, retailPrice: 33.66 },
      { weightMin: 5, weightMax: 10, purchasePrice: 24.72, retailPrice: 38.03 },
      { weightMin: 10, weightMax: 20, purchasePrice: 36.44, retailPrice: 56.06 }
    ]
  }
];

// Funzione principale per importare tutti i dati
async function importAllData() {
  try {
    // Cancella tutti i dati esistenti
    await Rate.deleteMany({});
    await Service.deleteMany({});
    await Carrier.deleteMany({});
    
    console.log('Database cleared successfully');
    
    // Inserisci i corrieri
    const createdCarriers = await Carrier.insertMany(carriers);
    
    // Mappa dei corrieri per ID
    const carrierMap = {};
    for (let i = 0; i < createdCarriers.length; i++) {
      carrierMap[createdCarriers[i].name] = createdCarriers[i]._id;
    }
    
    console.log('Carriers created successfully');
    
    // Funzione per importare servizi con le relative tariffe
    async function importServices(services, carrierName) {
      const carrierId = carrierMap[carrierName];
      
      // Inserisci servizi
      for (const serviceData of services) {
        const rates = [...serviceData.rates]; // Copia le tariffe
        delete serviceData.rates; // Rimuovi le tariffe dall'oggetto servizio
        
        // Crea il servizio
        const service = await Service.create({
          ...serviceData,
          carrier: carrierId
        });
        
        // Crea le tariffe per questo servizio
        const ratePromises = rates.map(rate => {
          return Rate.create({
            ...rate,
            service: service._id,
            volumeDiscount: 0,
            promotionalDiscount: 0,
            minimumVolume: 0,
            isActive: true
          });
        });
        
        await Promise.all(ratePromises);
      }
    }
    
    // Importa servizi e tariffe per ciascun corriere
    await importServices(brtServices, 'BRT');
    await importServices(dhlServices, 'DHL');
    await importServices(glsServices, 'GLS');
    await importServices(inpostServices, 'InPost');
    await importServices(posteServices, 'Poste Italiane');
    await importServices(fedexServices, 'FedEx');
    
    console.log('All services and rates imported successfully');
    
    // Statistiche finali
    const carriersCount = await Carrier.countDocuments();
    const servicesCount = await Service.countDocuments();
    const ratesCount = await Rate.countDocuments();
    
    console.log(`
      Import complete:
      - ${carriersCount} carriers
      - ${servicesCount} services
      - ${ratesCount} rates
    `);
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    // Chiudi la connessione a MongoDB
    mongoose.connection.close();
  }
}

// Esegui la funzione principale
importAllData().catch(err => {
  console.error('Error in importAllData:', err);
  mongoose.connection.close();
});