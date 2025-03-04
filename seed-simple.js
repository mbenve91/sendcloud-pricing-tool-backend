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
  }
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
  purchasePrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  destinationType: {
    type: String,
    enum: ['national', 'eu', 'extra_eu'],
    required: true
  }
});

// Creazione dei modelli
const Carrier = mongoose.model('Carrier', carrierSchema);
const Rate = mongoose.model('Rate', rateSchema);

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

// Dati di esempio semplificati
const carrierData = {
  name: 'DHL-Test',
  logoUrl: '/images/carriers/dhl.png',
  isVolumetric: true,
  fuelSurcharge: 9.2
};

// Funzione semplificata per il seeding
async function seedData() {
  try {
    // Rimuovi dati precedenti
    await Carrier.deleteMany({});
    await Rate.deleteMany({});
    console.log('Database ripulito');

    // Inserisci un carrier di test
    const carrier = new Carrier(carrierData);
    await carrier.save();
    console.log('Carrier di test inserito:', carrier._id);

    // Crea alcune tariffe di test
    const rates = [
      {
        carrierId: carrier._id,
        serviceCode: 'DHL_EXPRESS',
        serviceName: 'DHL Express',
        basePrice: 10.50,
        purchasePrice: 8.40,
        sellingPrice: 11.45,
        weight: 1,
        destinationType: 'national'
      },
      {
        carrierId: carrier._id,
        serviceCode: 'DHL_EXPRESS',
        serviceName: 'DHL Express',
        basePrice: 15.75,
        purchasePrice: 12.60,
        sellingPrice: 17.20,
        weight: 2,
        destinationType: 'national'
      }
    ];

    // Inserisci le tariffe di test
    await Rate.insertMany(rates);
    console.log(`Inserite ${rates.length} tariffe di test`);

    console.log('Seeding di test completato con successo');

    // Chiudi la connessione
    mongoose.connection.close();
  } catch (err) {
    console.error('Errore durante il seeding di test:', err);
    mongoose.connection.close();
  }
} 