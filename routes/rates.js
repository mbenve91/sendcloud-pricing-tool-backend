const express = require('express');
const router = express.Router();
const Rate = require('../models/rate');
const Carrier = require('../models/carrier');
const mongoose = require('mongoose');

// GET - Ottieni tutte le tariffe con filtri
router.get('/', async (req, res) => {
  try {
    const filter = {};

    // Applicazione dei filtri se presenti nella query
    if (req.query.carrierId) {
      filter.carrierId = mongoose.Types.ObjectId(req.query.carrierId);
    }
    
    if (req.query.destinationType) {
      filter.destinationType = req.query.destinationType;
    }
    
    if (req.query.weight) {
      // Trova tariffe per peso specifico o il peso più vicino
      const weight = parseFloat(req.query.weight);
      // Troviamo il peso più vicino
      const rates = await Rate.aggregate([
        { $match: { ...filter, active: true } },
        { $addFields: { weightDiff: { $abs: { $subtract: ['$weight', weight] } } } },
        { $sort: { weightDiff: 1 } },
        { $group: { 
          _id: { carrierId: '$carrierId', serviceCode: '$serviceCode' }, 
          doc: { $first: '$$ROOT' } 
        }},
        { $replaceRoot: { newRoot: '$doc' } }
      ]);

      // Aggiungiamo le informazioni del carrier
      const ratesWithCarrier = await Promise.all(rates.map(async (rate) => {
        const carrier = await Carrier.findById(rate.carrierId).select('name logoUrl');
        return {
          ...rate,
          carrierName: carrier.name,
          carrierLogo: carrier.logoUrl
        };
      }));

      return res.json(ratesWithCarrier);
    }
    
    if (req.query.serviceCode) {
      filter.serviceCode = req.query.serviceCode;
    }
    
    if (req.query.destinationCountry) {
      filter.destinationCountry = req.query.destinationCountry;
    }

    // Filtra solo tariffe attive a meno che non sia specificato diversamente
    if (!req.query.includeInactive) {
      filter.active = true;
    }

    // Trova le tariffe
    const rates = await Rate.find(filter);
    
    // Aggiungiamo le informazioni del carrier
    const ratesWithCarrier = await Promise.all(rates.map(async (rate) => {
      const carrier = await Carrier.findById(rate.carrierId).select('name logoUrl');
      return {
        id: rate._id,
        carrierId: rate.carrierId,
        carrierName: carrier.name,
        carrierLogo: carrier.logoUrl,
        serviceCode: rate.serviceCode,
        serviceName: rate.serviceName,
        basePrice: rate.basePrice,
        fuelSurcharge: rate.fuelSurcharge,
        totalBasePrice: rate.basePrice + (rate.basePrice * rate.fuelSurcharge / 100),
        volumeDiscount: rate.volumeDiscount,
        promotionDiscount: rate.promotionDiscount,
        totalDiscountPercentage: rate.totalDiscountPercentage,
        finalPrice: rate.finalPrice,
        actualMargin: rate.actualMargin,
        weight: rate.weight,
        destinationType: rate.destinationType,
        destinationCountry: rate.destinationCountry,
        deliveryTimeMin: rate.deliveryTimeMin,
        deliveryTimeMax: rate.deliveryTimeMax,
        purchasePrice: rate.purchasePrice,
        sellingPrice: rate.sellingPrice,
        marginDiscount: rate.marginDiscount,
        customSellingPrice: rate.customSellingPrice,
        remainingMargin: rate.remainingMargin
      };
    }));

    res.json(ratesWithCarrier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Ottieni una tariffa specifica per ID
router.get('/:id', async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Tariffa non trovata' });
    }
    
    const carrier = await Carrier.findById(rate.carrierId).select('name logoUrl');
    
    const rateWithCarrier = {
      id: rate._id,
      carrierId: rate.carrierId,
      carrierName: carrier.name,
      carrierLogo: carrier.logoUrl,
      serviceCode: rate.serviceCode,
      serviceName: rate.serviceName,
      basePrice: rate.basePrice,
      fuelSurcharge: rate.fuelSurcharge,
      totalBasePrice: rate.basePrice + (rate.basePrice * rate.fuelSurcharge / 100),
      volumeDiscount: rate.volumeDiscount,
      promotionDiscount: rate.promotionDiscount,
      totalDiscountPercentage: rate.totalDiscountPercentage,
      finalPrice: rate.finalPrice,
      actualMargin: rate.actualMargin,
      weight: rate.weight,
      destinationType: rate.destinationType,
      destinationCountry: rate.destinationCountry,
      deliveryTimeMin: rate.deliveryTimeMin,
      deliveryTimeMax: rate.deliveryTimeMax,
      purchasePrice: rate.purchasePrice,
      sellingPrice: rate.sellingPrice,
      marginDiscount: rate.marginDiscount,
      customSellingPrice: rate.customSellingPrice,
      remainingMargin: rate.remainingMargin
    };
    
    res.json(rateWithCarrier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Crea una nuova tariffa
router.post('/', async (req, res) => {
  try {
    // Verifica che il carrier esista
    const carrier = await Carrier.findById(req.body.carrierId);
    if (!carrier) {
      return res.status(404).json({ message: 'Carrier non trovato' });
    }
    
    const rate = new Rate({
      carrierId: req.body.carrierId,
      serviceCode: req.body.serviceCode,
      serviceName: req.body.serviceName,
      basePrice: req.body.basePrice,
      fuelSurcharge: req.body.fuelSurcharge || carrier.fuelSurcharge,
      volumeDiscount: req.body.volumeDiscount || 0,
      promotionDiscount: req.body.promotionDiscount || 0,
      purchasePrice: req.body.purchasePrice,
      sellingPrice: req.body.sellingPrice,
      marginDiscount: req.body.marginDiscount || 0,
      weight: req.body.weight,
      destinationType: req.body.destinationType,
      destinationCountry: req.body.destinationCountry,
      deliveryTimeMin: req.body.deliveryTimeMin,
      deliveryTimeMax: req.body.deliveryTimeMax
    });

    const newRate = await rate.save();
    res.status(201).json(newRate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aggiorna una tariffa esistente
router.put('/:id', async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Tariffa non trovata' });
    }

    // Aggiorna i campi
    if (req.body.carrierId) rate.carrierId = req.body.carrierId;
    if (req.body.serviceCode) rate.serviceCode = req.body.serviceCode;
    if (req.body.serviceName) rate.serviceName = req.body.serviceName;
    if (req.body.basePrice !== undefined) rate.basePrice = req.body.basePrice;
    if (req.body.fuelSurcharge !== undefined) rate.fuelSurcharge = req.body.fuelSurcharge;
    if (req.body.volumeDiscount !== undefined) rate.volumeDiscount = req.body.volumeDiscount;
    if (req.body.promotionDiscount !== undefined) rate.promotionDiscount = req.body.promotionDiscount;
    if (req.body.purchasePrice !== undefined) rate.purchasePrice = req.body.purchasePrice;
    if (req.body.sellingPrice !== undefined) rate.sellingPrice = req.body.sellingPrice;
    if (req.body.marginDiscount !== undefined) rate.marginDiscount = req.body.marginDiscount;
    if (req.body.weight !== undefined) rate.weight = req.body.weight;
    if (req.body.destinationType) rate.destinationType = req.body.destinationType;
    if (req.body.destinationCountry) rate.destinationCountry = req.body.destinationCountry;
    if (req.body.deliveryTimeMin !== undefined) rate.deliveryTimeMin = req.body.deliveryTimeMin;
    if (req.body.deliveryTimeMax !== undefined) rate.deliveryTimeMax = req.body.deliveryTimeMax;
    if (req.body.active !== undefined) rate.active = req.body.active;

    const updatedRate = await rate.save();
    res.json(updatedRate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH - Aggiorna lo sconto sul margine di una tariffa
router.patch('/:id/margin-discount', async (req, res) => {
  try {
    if (req.body.marginDiscount === undefined) {
      return res.status(400).json({ message: 'Sconto sul margine richiesto' });
    }

    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Tariffa non trovata' });
    }

    rate.marginDiscount = req.body.marginDiscount;
    const updatedRate = await rate.save();
    
    const carrier = await Carrier.findById(rate.carrierId).select('name logoUrl');
    
    const rateWithCarrier = {
      id: updatedRate._id,
      carrierId: updatedRate.carrierId,
      carrierName: carrier.name,
      carrierLogo: carrier.logoUrl,
      serviceCode: updatedRate.serviceCode,
      serviceName: updatedRate.serviceName,
      basePrice: updatedRate.basePrice,
      fuelSurcharge: updatedRate.fuelSurcharge,
      totalBasePrice: updatedRate.basePrice + (updatedRate.basePrice * updatedRate.fuelSurcharge / 100),
      volumeDiscount: updatedRate.volumeDiscount,
      promotionDiscount: updatedRate.promotionDiscount,
      totalDiscountPercentage: updatedRate.totalDiscountPercentage,
      finalPrice: updatedRate.finalPrice,
      actualMargin: updatedRate.actualMargin,
      weight: updatedRate.weight,
      destinationType: updatedRate.destinationType,
      destinationCountry: updatedRate.destinationCountry,
      deliveryTimeMin: updatedRate.deliveryTimeMin,
      deliveryTimeMax: updatedRate.deliveryTimeMax,
      purchasePrice: updatedRate.purchasePrice,
      sellingPrice: updatedRate.sellingPrice,
      marginDiscount: updatedRate.marginDiscount,
      customSellingPrice: updatedRate.customSellingPrice,
      remainingMargin: updatedRate.remainingMargin
    };
    
    res.json(rateWithCarrier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Elimina una tariffa
router.delete('/:id', async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: 'Tariffa non trovata' });
    }

    await rate.deleteOne();
    res.json({ message: 'Tariffa eliminata' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 