const mongoose = require('mongoose');
const { loadModel } = require('./modelLoader');
const Rate = loadModel('Rate');
const Service = loadModel('Service');

// Funzione per ottenere tutte le fasce di peso per un servizio
exports.getAllWeightRangesForService = async (serviceId) => {
  try {
    // Trova tutte le tariffe per questo servizio
    const rates = await Rate.find({ service: serviceId }).sort({ weightMin: 1 });
    
    // Mappiamo nel formato richiesto dal frontend
    return rates.map(rate => ({
      id: `${rate._id}-${rate.weightMin}-${rate.weightMax}`,
      label: `${rate.weightMin}-${rate.weightMax} kg`,
      min: rate.weightMin,
      max: rate.weightMax,
      basePrice: rate.retailPrice,
      userDiscount: 0,
      finalPrice: rate.retailPrice,
      actualMargin: rate.margin || (rate.retailPrice - rate.purchasePrice),
      volumeDiscount: rate.volumeDiscount || 0,
      promotionDiscount: rate.promotionDiscount || 0
    }));
  } catch (error) {
    console.error('Errore nel recupero delle fasce di peso:', error);
    return [];
  }
}; 