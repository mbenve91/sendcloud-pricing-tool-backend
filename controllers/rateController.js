// controllers/rateController.js - Rate operations
const { loadModel } = require('../utils/modelLoader');
const Rate = loadModel('Rate');
const Carrier = loadModel('Carrier');
const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');

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
        console.log(`Servizio: ${rate.service.name}, Tipo: ${rate.service.destinationType}, Paese: ${rate.service.destinationCountry || 'Non specificato'}`);
      }
    });
    
    // Filtra le tariffe in base agli altri criteri
    let filteredRates = rates.filter(rate => {
      // Verifica che il servizio esista
      if (!rate.service) return false;
      
      // Filtra per tipo di destinazione se specificato
      if (destinationType && rate.service.destinationType !== destinationType) {
        return false;
      }
      
      // Se abbiamo un paese specifico, filtra per quel paese
      if (destinationCountry) {
        if (rate.service.destinationCountry?.toLowerCase() !== destinationCountry.toLowerCase()) {
          return false;
        }
      }
      // Altrimenti, se euType è specificato, filtra in base alla regione EU/Extra EU
      else if (destinationType === 'international' && euType) {
        // Determina se il servizio è per EU o Extra EU in base al paese di destinazione
        const countryCode = rate.service.destinationCountry?.toUpperCase();
        
        // Usa il campo isEU salvato nel database
        const isEUCountry = rate.service.isEU === true;
        
        console.log(`Servizio per ${rate.service.name}, paese: ${countryCode}, isEU nel DB: ${isEUCountry}, euType richiesto: ${euType}`);
        
        if (euType === 'eu' && !isEUCountry) {
          return false;
        }
        if (euType === 'extra_eu' && isEUCountry) {
          return false;
        }
      }
      
      // Filtra per corriere se specificato
      if (carrier && rate.service.carrier._id.toString() !== carrier) {
        return false;
      }
      
      // Filtra per tipo di servizio se specificato
      if (serviceType && rate.service.serviceType !== serviceType) {
        return false;
      }
      
      // Verifica margine minimo se specificato
      const marginPercentage = rate.marginPercentage || 
        ((rate.retailPrice - rate.purchasePrice) / rate.retailPrice) * 100;
      
      if (parseFloat(minMargin) > 0 && marginPercentage < parseFloat(minMargin)) {
        return false;
      }
      
      return true;
    });
    
    console.log(`Filtrate a ${filteredRates.length} tariffe dopo i criteri`);
    
    // Trasforma i dati per il frontend
    const formattedRates = filteredRates.map(rate => {
      const service = rate.service;
      const carrier = service?.carrier || {};
      
      return {
        _id: rate._id,
        service: service._id,
        serviceCode: service.code,
        serviceName: service.name,
        description: service.description,
        weightMin: rate.weightMin,
        weightMax: rate.weightMax,
        purchasePrice: rate.purchasePrice,
        retailPrice: rate.retailPrice,
        margin: rate.margin,
        marginPercentage: rate.marginPercentage,
        destinationType: service.destinationType,
        destinationCountry: service.destinationCountry,
        deliveryTimeMin: service.deliveryTimeMin,
        deliveryTimeMax: service.deliveryTimeMax,
        carrier: {
          _id: carrier._id,
          name: carrier.name,
          logoUrl: carrier.logoUrl,
          isVolumetric: carrier.isVolumetric,
          fuelSurcharge: carrier.fuelSurcharge
        }
      };
    });
    
    // Ordina per prezzo retail più basso
    const sortedRates = formattedRates.sort((a, b) => a.retailPrice - b.retailPrice);
    
    res.status(200).json({
      success: true,
      count: sortedRates.length,
      data: sortedRates
    });
  } catch (error) {
    console.error('Errore in compareRates:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante il confronto delle tariffe'
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