// controllers/rateController.js - Rate operations
const { loadModel } = require('../utils/modelLoader');
const Rate = loadModel('Rate');
const Carrier = loadModel('Carrier');
const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');

// Gestione del modulo ErrorResponse con fallback
let ErrorResponse;
try {
  ErrorResponse = require('../utils/errorResponse');
} catch (err) {
  // Fallback: definisce una classe ErrorResponse di base se il modulo non è disponibile
  ErrorResponse = class extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
    }
  };
}

// Elenco di codici paesi EU
const EU_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
                      'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
                      'SI', 'ES', 'SE'];

// @desc    Get all rates
// @route   GET /api/rates
// @access  Private
exports.getRates = asyncHandler(async (req, res) => {
  let query = {};
  
  // Build query from request query parameters
  if (req.query.carrier) {
    query.carrier = req.query.carrier;
  }
  
  if (req.query.serviceCode) {
    query.serviceCode = req.query.serviceCode;
  }
  
  if (req.query.destinationType) {
    query.destinationType = req.query.destinationType;
  }
  
  if (req.query.destinationCountry) {
    query.destinationCountry = req.query.destinationCountry;
  }
  
  const rates = await Rate.find(query).populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  res.status(200).json({
    success: true,
    count: rates.length,
    data: rates
  });
});

// @desc    Get rates for comparison based on weight, destination, etc.
// @route   GET /api/rates/compare
// @access  Private
exports.compareRates = asyncHandler(async (req, res) => {
  const { 
    weight, 
    destinationType = 'national', 
    destinationCountry = null,
    carrier = null,
    serviceType = null,
    euType = null,
    minMargin = 0 
  } = req.query;
  
  console.log(`RICEVUTA RICHIESTA TARIFFE - Parametri: weight=${weight}, destinationType=${destinationType}, euType=${euType}`);
  
  if (!weight) {
    res.status(400);
    throw new Error('Weight is required for rate comparison');
  }
  
  // Parse weight to number
  const weightNum = parseFloat(weight);
  
  // Build base query per peso
  const query = {
    weightMin: { $lte: weightNum },
    weightMax: { $gte: weightNum },
    isActive: true
  };
  
  try {
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
    console.log(`Parametri di filtro: destinationType=${destinationType}, euType=${euType}, destinationCountry=${destinationCountry}`);
    
    // Stampiamo informazioni sui servizi disponibili
    rates.forEach(rate => {
      if (rate.service) {
        console.log(`Servizio: ${rate.service.name}, Tipo: ${rate.service.destinationType}, Paese: ${rate.service.destinationCountry || 'Non specificato'}, isEU: ${rate.service.isEU}`);
      }
    });
    
    // Filtra le tariffe in base agli altri criteri
    let filteredRates = rates.filter(rate => {
      // Verifica che il servizio esista
      if (!rate.service) {
        console.log(`Rata scartata: servizio mancante`);
        return false;
      }
      
      // Filtra per tipo di destinazione se specificato
      if (destinationType && rate.service.destinationType !== destinationType) {
        console.log(`Rata scartata per ${rate.service.name}: destinationType non corrisponde (richiesto ${destinationType}, trovato ${rate.service.destinationType})`);
        return false;
      }
      
      // Se abbiamo un paese specifico, filtra per quel paese
      if (destinationCountry) {
        // Verifica se il paese è incluso nel campo destinationCountry (che può contenere più paesi separati da virgole)
        const serviceCountries = rate.service.destinationCountry ? rate.service.destinationCountry.split(/,\s*/).map(c => c.toUpperCase()) : [];
        const matchesCountry = serviceCountries.includes(destinationCountry.toUpperCase());
        
        if (!matchesCountry) {
          console.log(`Rata scartata per ${rate.service.name}: paese non corrisponde (richiesto ${destinationCountry}, trovato ${rate.service.destinationCountry})`);
          return false;
        }
      }
      // Altrimenti, se euType è specificato, filtra in base alla regione EU/Extra EU
      else if (destinationType === 'international' && euType) {
        const isEUCountry = rate.service.isEU === true;
        
        console.log(`Controllo EU per servizio ${rate.service.name}: isEU nel DB=${isEUCountry}, euType richiesto=${euType}`);
        
        if (euType === 'eu' && !isEUCountry) {
          console.log(`Rata scartata per ${rate.service.name}: non è un servizio EU`);
          return false;
        }
        if (euType === 'extra_eu' && isEUCountry) {
          console.log(`Rata scartata per ${rate.service.name}: non è un servizio Extra-EU`);
          return false;
        }
      }
      
      // Filtra per corriere se specificato
      if (carrier && rate.service.carrier && rate.service.carrier._id.toString() !== carrier) {
        console.log(`Rata scartata per ${rate.service.name}: corriere non corrisponde`);
        return false;
      }
      
      // Filtra per tipo di servizio se specificato
      if (serviceType && rate.service.serviceType !== serviceType) {
        console.log(`Rata scartata per ${rate.service.name}: tipo servizio non corrisponde`);
        return false;
      }
      
      // Verifica margine minimo se specificato
      const marginPercentage = rate.marginPercentage || 
        ((rate.retailPrice - rate.purchasePrice) / rate.retailPrice) * 100;
      
      if (parseFloat(minMargin) > 0 && marginPercentage < parseFloat(minMargin)) {
        console.log(`Rata scartata per ${rate.service.name}: margine insufficiente`);
        return false;
      }
      
      console.log(`Rata accettata per ${rate.service.name}`);
      return true;
    });
    
    console.log(`Dopo il filtraggio: ${filteredRates.length} tariffe`);
    
    if (filteredRates.length === 0 && euType) {
      // Se non ci sono risultati con il filtro EU/Extra EU ma è stato richiesto, proviamo a verificare il DB
      const services = await Service.find({ destinationType: 'international' });
      console.log(`Controllo servizi internazionali presenti nel DB: ${services.length}`);
      services.forEach(service => {
        console.log(`Servizio ${service.name}: isEU=${service.isEU}, destinationCountry=${service.destinationCountry}`);
      });
    }
    
    res.status(200).json({
      success: true,
      count: filteredRates.length,
      data: filteredRates
    });
  } catch (error) {
    console.error('Errore nella ricerca delle tariffe:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing rates',
      error: error.message
    });
  }
});

// @desc    Get single rate
// @route   GET /api/rates/:id
// @access  Private
exports.getRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findById(req.params.id).populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  if (!rate) {
    res.status(404);
    throw new Error('Rate not found');
  }
  
  res.status(200).json({
    success: true,
    data: rate
  });
});

// @desc    Create rate
// @route   POST /api/rates
// @access  Private/Admin
exports.createRate = asyncHandler(async (req, res) => {
  // Check if carrier exists
  const carrier = await Carrier.findById(req.body.carrier);
  
  if (!carrier) {
    res.status(404);
    throw new Error('Carrier not found');
  }
  
  const rate = await Rate.create(req.body);
  
  res.status(201).json({
    success: true,
    data: rate
  });
});

// @desc    Update rate
// @route   PUT /api/rates/:id
// @access  Private/Admin
exports.updateRate = asyncHandler(async (req, res) => {
  let rate = await Rate.findById(req.params.id);
  
  if (!rate) {
    res.status(404);
    throw new Error('Rate not found');
  }
  
  rate = await Rate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: rate
  });
});

// @desc    Delete rate
// @route   DELETE /api/rates/:id
// @access  Private/Admin
exports.deleteRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findById(req.params.id);
  
  if (!rate) {
    res.status(404);
    throw new Error('Rate not found');
  }
  
  await rate.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get rates by carrier
// @route   GET /api/rates/carrier/:carrierId
// @access  Private
exports.getRatesByCarrier = asyncHandler(async (req, res) => {
  const rates = await Rate.find({ carrier: req.params.carrierId })
    .populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  res.status(200).json({
    success: true,
    count: rates.length,
    data: rates
  });
});

// @desc    Get all weight ranges for a specific service
// @route   GET /api/rates/service/:serviceId/weightRanges
// @access  Private
exports.getWeightRangesByService = asyncHandler(async (req, res) => {
  const serviceId = req.params.serviceId;
  
  if (!serviceId) {
    res.status(400);
    throw new Error('Service ID is required');
  }
  
  try {
    // Verifica che il servizio esista
    const service = await Service.findById(serviceId);
    
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }
    
    // Trova tutte le tariffe per questo servizio
    const rates = await Rate.find({ service: serviceId }).sort({ weightMin: 1 });
    
    // Trasforma nel formato richiesto
    const weightRanges = rates.map(rate => ({
      id: `${rate._id}`,
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
    
    res.status(200).json({
      success: true,
      count: weightRanges.length,
      data: weightRanges
    });
    
  } catch (error) {
    console.error('Errore nel recupero delle fasce di peso:', error);
    res.status(500);
    throw new Error('Error retrieving weight ranges');
  }
});