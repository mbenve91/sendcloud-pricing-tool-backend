const express = require('express');
const router = express.Router();
const Carrier = require('../models/carrier');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configurazione di multer per il caricamento dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Solo file CSV sono supportati'), false);
    }
    cb(null, true);
  }
});

// Ottieni tutti i corrieri attivi
router.get('/carriers', async (req, res) => {
  try {
    const carriers = await Carrier.find({ isActive: true });
    res.json(carriers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ottieni dettagli di un singolo corriere
router.get('/carriers/:id', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) return res.status(404).json({ message: 'Corriere non trovato' });
    res.json(carrier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confronta le tariffe dei corrieri in base ai filtri
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
      query._id = { $in: carrierIds };
    }
    
    // Filtra i servizi se specificati
    let serviceFilter = {};
    if (serviceTypes && serviceTypes.length > 0) {
      serviceFilter = { 'services.name': { $in: serviceTypes } };
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
        if (serviceTypes && serviceTypes.length > 0 && !serviceTypes.includes(service.name)) return;
        
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

// Ottieni suggerimenti AI per migliorare le tariffe
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
    });
    
    // Ordina i suggerimenti per rilevanza (maggiore sconto in cima)
    suggestions.sort((a, b) => {
      if (a.type === 'active_promotion' && b.type === 'volume_increase') return -1;
      if (a.type === 'volume_increase' && b.type === 'active_promotion') return 1;
      
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

// Carica i dati dei corrieri da un file CSV
router.post('/carriers/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    const { carrierId } = req.body;
    if (!carrierId) {
      return res.status(400).json({ message: 'ID del corriere richiesto' });
    }

    // Trova il corriere esistente
    const carrier = await Carrier.findById(carrierId);
    if (!carrier) {
      return res.status(404).json({ message: 'Corriere non trovato' });
    }

    const results = [];
    const errors = [];

    // Leggi il file CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        // Elabora i dati CSV
        for (const row of results) {
          try {
            const serviceName = row.serviceName;
            const serviceCode = row.serviceCode || serviceName.toLowerCase().replace(/\s+/g, '_');
            const destinationType = row.destinationType || 'national';
            const countryCode = row.countryCode || null;
            const minWeight = parseFloat(row.minWeight) || 0;
            const maxWeight = parseFloat(row.maxWeight) || 100;
            const retailPrice = parseFloat(row.retailPrice) || 0;
            const purchasePrice = parseFloat(row.purchasePrice) || 0;
            const margin = row.margin ? parseFloat(row.margin) : (retailPrice - purchasePrice);
            const deliveryTimeMin = row.deliveryTimeMin ? parseInt(row.deliveryTimeMin) : null;
            const deliveryTimeMax = row.deliveryTimeMax ? parseInt(row.deliveryTimeMax) : null;
            
            // Verifica se il servizio esiste già
            let service = carrier.services.find(s => s.code === serviceCode);
            
            if (!service) {
              // Crea un nuovo servizio
              service = {
                name: serviceName,
                code: serviceCode,
                description: row.description || '',
                deliveryTimeMin,
                deliveryTimeMax,
                destinationTypes: [destinationType],
                pricing: []
              };
              carrier.services.push(service);
            } else if (!service.destinationTypes.includes(destinationType)) {
              service.destinationTypes.push(destinationType);
            }
            
            // Trova il pricing per la destinazione
            let pricing = service.pricing.find(p => 
              p.destinationType === destinationType && 
              (p.countryCode === countryCode || (countryCode === null && p.countryCode === null))
            );
            
            if (!pricing) {
              pricing = {
                destinationType,
                countryCode,
                weightRanges: []
              };
              service.pricing.push(pricing);
            }
            
            // Aggiungi o aggiorna il range di peso
            const existingWeightRange = pricing.weightRanges.find(wr => 
              wr.min === minWeight && wr.max === maxWeight
            );
            
            if (existingWeightRange) {
              existingWeightRange.retailPrice = retailPrice;
              existingWeightRange.purchasePrice = purchasePrice;
              existingWeightRange.margin = margin;
            } else {
              pricing.weightRanges.push({
                min: minWeight,
                max: maxWeight,
                retailPrice,
                purchasePrice,
                margin
              });
            }
          } catch (error) {
            errors.push({ row, error: error.message });
          }
        }
        
        // Salva le modifiche
        await carrier.save();
        
        // Elimina il file temporaneo
        fs.unlinkSync(req.file.path);
        
        res.json({ 
          message: 'Dati del corriere aggiornati con successo', 
          rowsProcessed: results.length,
          errors: errors.length > 0 ? errors : null
        });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crea un nuovo corriere
router.post('/carriers', async (req, res) => {
  try {
    const carrier = new Carrier(req.body);
    const savedCarrier = await carrier.save();
    res.status(201).json(savedCarrier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;