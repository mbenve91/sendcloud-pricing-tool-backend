const express = require('express');
const router = express.Router();
const Carrier = require('../models/carrier');

/**
 * @route   GET /api/carriers
 * @desc    Ottiene tutti i corrieri attivi
 * @access  Public
 */
router.get('/carriers', async (req, res) => {
  try {
    const carriers = await Carrier.find({ isActive: true });
    res.json(carriers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/carriers/:id
 * @desc    Ottiene dettagli di un singolo corriere
 * @access  Public
 */
router.get('/carriers/:id', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) return res.status(404).json({ message: 'Corriere non trovato' });
    res.json(carrier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/compare-rates
 * @desc    Confronta le tariffe dei corrieri in base ai filtri
 * @access  Public
 * @params  weight, destinationType, countryCode, volume, carrierIds, serviceTypes
 */
router.get('/compare-rates', async (req, res) => {
  try {
    const { 
      weight, 
      destinationType, 
      countryCode, 
      volume,
      carrierIds,
      serviceTypes
    } = req.query;
    
    // Valida i parametri obbligatori
    if (!weight || !destinationType) {
      return res.status(400).json({ message: 'Peso e tipo di destinazione sono obbligatori' });
    }
    
    // Costruisci la query per filtrare i corrieri
    const query = { isActive: true };
    if (carrierIds && carrierIds.length > 0) {
      query._id = { $in: carrierIds.split(',') };
    }
    
    // Filtra i servizi se specificati
    let serviceFilter = {};
    if (serviceTypes && serviceTypes.length > 0) {
      serviceFilter = { 'services.name': { $in: serviceTypes.split(',') } };
    }
    
    // Ottieni tutti i corrieri che soddisfano i criteri
    const carriers = await Carrier.find({ ...query, ...serviceFilter });
    
    // Calcola le tariffe per ciascun corriere e servizio
    const results = [];
    
    carriers.forEach(carrier => {
      carrier.services.forEach(service => {
        // Verifica se il servizio è disponibile per il tipo di destinazione
        if (!service.destinationTypes.includes(destinationType)) return;
        
        // Verifica se ci sono filtri per tipo di servizio
        if (serviceTypes && serviceTypes.length > 0 && 
            !serviceTypes.split(',').includes(service.name)) return;
        
        // Calcola il prezzo finale
        const priceDetails = carrier.calculateFinalPrice(
          service.code,
          parseFloat(weight),
          destinationType,
          countryCode || null,
          volume ? parseInt(volume) : null
        );
        
        if (priceDetails) {
          results.push({
            carrierId: carrier._id,
            carrierName: carrier.name,
            carrierLogo: carrier.logoUrl,
            serviceCode: service.code,
            serviceName: service.name,
            deliveryTimeMin: service.deliveryTimeMin,
            deliveryTimeMax: service.deliveryTimeMax,
            weight: parseFloat(weight),
            destinationType,
            countryCode: countryCode || null,
            ...priceDetails
          });
        }
      });
    });
    
    // Ordina i risultati per prezzo finale (dal più economico al più costoso)
    results.sort((a, b) => a.finalPrice - b.finalPrice);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/ai-suggestions
 * @desc    Ottiene suggerimenti AI per migliorare le tariffe
 * @access  Public
 * @params  weight, destinationType, volume
 */
router.get('/ai-suggestions', async (req, res) => {
  try {
    const { weight, destinationType, volume } = req.query;
    
    if (!weight || !destinationType || !volume) {
      return res.status(400).json({ message: 'Parametri mancanti per i suggerimenti AI' });
    }
    
    // Ottieni tutti i corrieri attivi
    const carriers = await Carrier.find({ isActive: true });
    
    const suggestions = [];
    
    // Trova i corrieri con gli sconti per volume più vantaggiosi
    carriers.forEach(carrier => {
      const volumeDiscounts = carrier.volumeDiscounts
        .filter(vd => parseInt(volume) >= vd.minVolume && (!vd.maxVolume || parseInt(volume) <= vd.maxVolume))
        .sort((a, b) => b.discountPercentage - a.discountPercentage);
      
      if (volumeDiscounts.length > 0) {
        const bestDiscount = volumeDiscounts[0];
        
        // Verifica se ci sono soglie di volume superiori che potrebbero dare sconti migliori
        const nextVolumeThreshold = carrier.volumeDiscounts
          .filter(vd => vd.minVolume > parseInt(volume))
          .sort((a, b) => a.minVolume - b.minVolume)[0];
        
        if (nextVolumeThreshold && nextVolumeThreshold.discountPercentage > bestDiscount.discountPercentage) {
          suggestions.push({
            type: 'volume_increase',
            carrierId: carrier._id,
            carrierName: carrier.name,
            currentVolume: parseInt(volume),
            currentDiscount: bestDiscount.discountPercentage,
            suggestedVolume: nextVolumeThreshold.minVolume,
            suggestedDiscount: nextVolumeThreshold.discountPercentage,
            message: `Aumentando il volume a ${nextVolumeThreshold.minVolume} spedizioni mensili, puoi ottenere uno sconto del ${nextVolumeThreshold.discountPercentage}% con ${carrier.name}`
          });
        }
      }
      
      // Trova promozioni attive
      const currentDate = new Date();
      const activePromotions = carrier.promotions
        .filter(p => currentDate >= p.startDate && currentDate <= p.endDate)
        .sort((a, b) => b.discountPercentage - a.discountPercentage);
      
      if (activePromotions.length > 0) {
        suggestions.push({
          type: 'active_promotion',
          carrierId: carrier._id,
          carrierName: carrier.name,
          promotionName: activePromotions[0].name,
          discountPercentage: activePromotions[0].discountPercentage,
          endDate: activePromotions[0].endDate,
          message: `Approfitta della promozione "${activePromotions[0].name}" di ${carrier.name} con uno sconto del ${activePromotions[0].discountPercentage}%, valida fino al ${activePromotions[0].endDate.toLocaleDateString()}`
        });
      }
      
      // Analisi del margine e suggerimenti per migliorarlo
      carrier.services.forEach(service => {
        if (!service.destinationTypes.includes(destinationType)) return;
        
        const priceDetails = carrier.calculateFinalPrice(
          service.code,
          parseFloat(weight),
          destinationType,
          null,
          parseInt(volume)
        );
        
        if (priceDetails && priceDetails.actualMargin < 15) {
          suggestions.push({
            type: 'margin_warning',
            carrierId: carrier._id,
            carrierName: carrier.name,
            serviceName: service.name,
            currentMargin: priceDetails.actualMargin,
            message: `Attenzione: il margine per ${service.name} di ${carrier.name} è solo del ${priceDetails.actualMargin.toFixed(2)}%. Considera di aumentare il prezzo o negoziare migliori tariffe d'acquisto.`
          });
        }
      });
    });
    
    // Ordina i suggerimenti per rilevanza
    suggestions.sort((a, b) => {
      // Priorità ai warning sui margini
      if (a.type === 'margin_warning' && b.type !== 'margin_warning') return -1;
      if (a.type !== 'margin_warning' && b.type === 'margin_warning') return 1;
      
      // Poi promozioni attive
      if (a.type === 'active_promotion' && b.type === 'volume_increase') return -1;
      if (a.type === 'volume_increase' && b.type === 'active_promotion') return 1;
      
      // Ordina per percentuale di sconto
      if (a.type === 'active_promotion' && b.type === 'active_promotion') {
        return b.discountPercentage - a.discountPercentage;
      }
      
      if (a.type === 'volume_increase' && b.type === 'volume_increase') {
        return b.suggestedDiscount - a.suggestedDiscount;
      }
      
      return 0;
    });
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 