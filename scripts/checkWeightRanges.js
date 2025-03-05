const mongoose = require('mongoose');
const { loadModel } = require('../utils/modelLoader');
const Rate = loadModel('Rate');
const Service = loadModel('Service');
const Carrier = loadModel('Carrier');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:password@cluster0.lluzw.mongodb.net/sendcloud-pricing-tool';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connesso');
    
    try {
      // Proviamo a ottenere tutte le tariffe per un peso specifico
      const weightNum = 2.5;
      const query = {
        weightMin: { $lte: weightNum },
        weightMax: { $gte: weightNum },
        isActive: true
      };
      
      // Ottieni tutte le tariffe che corrispondono al peso
      const rates = await Rate.find(query)
        .populate({
          path: 'service',
          populate: {
            path: 'carrier',
            select: 'name logoUrl isVolumetric fuelSurcharge'
          }
        });
      
      console.log(`Trovate ${rates.length} tariffe per peso ${weightNum}`);
      
      // Estrai tutte le fasce di peso per ciascun servizio
      for (const rate of rates) {
        if (!rate.service) continue;
        
        console.log(`\nServizio: ${rate.service.name}`);
        console.log(`Rate specifica: min=${rate.weightMin}, max=${rate.weightMax}, prezzo=${rate.retailPrice}`);
        
        // Cerca tutte le fasce di peso per lo stesso servizio
        const allWeightRanges = await Rate.find({ service: rate.service._id }).sort({ weightMin: 1 });
        
        console.log(`Tutte le fasce di peso per questo servizio (${allWeightRanges.length}):`);
        allWeightRanges.forEach(weightRange => {
          console.log(`  - Peso: ${weightRange.weightMin}-${weightRange.weightMax} kg, Prezzo: ${weightRange.retailPrice}, Margin: ${weightRange.margin}`);
        });
      }
      
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      mongoose.disconnect();
      console.log('Connessione MongoDB chiusa');
    }
  })
  .catch(err => {
    console.error('Errore di connessione a MongoDB:', err);
  }); 