const express = require('express');
const router = express.Router();
const Carrier = require('../models/carrier');
const { uploadSingle } = require('../middleware/upload');
const { parseCSV, validateCarriersData } = require('../utils/csvParser');
const fs = require('fs-extra');

// GET - Ottieni tutti i carrier
router.get('/', async (req, res) => {
  try {
    const carriers = await Carrier.find().select('name logoUrl isVolumetric fuelSurcharge');
    res.json(carriers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Ottieni un carrier specifico per ID
router.get('/:id', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) {
      return res.status(404).json({ message: 'Carrier non trovato' });
    }
    res.json(carrier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Crea un nuovo carrier
router.post('/', async (req, res) => {
  const carrier = new Carrier({
    name: req.body.name,
    logoUrl: req.body.logoUrl,
    isVolumetric: req.body.isVolumetric,
    fuelSurcharge: req.body.fuelSurcharge,
    services: req.body.services
  });

  try {
    const newCarrier = await carrier.save();
    res.status(201).json(newCarrier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Aggiorna un carrier esistente
router.put('/:id', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) {
      return res.status(404).json({ message: 'Carrier non trovato' });
    }

    // Aggiorna i campi
    if (req.body.name) carrier.name = req.body.name;
    if (req.body.logoUrl) carrier.logoUrl = req.body.logoUrl;
    if (req.body.isVolumetric !== undefined) carrier.isVolumetric = req.body.isVolumetric;
    if (req.body.fuelSurcharge !== undefined) carrier.fuelSurcharge = req.body.fuelSurcharge;
    if (req.body.services) carrier.services = req.body.services;

    const updatedCarrier = await carrier.save();
    res.json(updatedCarrier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Elimina un carrier
router.delete('/:id', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) {
      return res.status(404).json({ message: 'Carrier non trovato' });
    }

    await carrier.deleteOne();
    res.json({ message: 'Carrier eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Ottieni tutti i servizi di un carrier
router.get('/:id/services', async (req, res) => {
  try {
    const carrier = await Carrier.findById(req.params.id);
    if (!carrier) {
      return res.status(404).json({ message: 'Carrier non trovato' });
    }
    res.json(carrier.services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Importa carriers da CSV
router.post('/import', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nessun file caricato' });
    }

    // Parsa il file CSV
    const carriers = await parseCSV(req.file.path);
    
    // Valida i dati
    const { validCarriers, errors } = validateCarriersData(carriers);
    
    // Verifica se ci sono errori di validazione
    if (errors.length > 0 && validCarriers.length === 0) {
      // Elimina il file caricato
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Validazione fallita', errors });
    }
    
    // Salva i carrier validi nel database
    const results = {
      success: [],
      errors: [...errors]
    };
    
    for (const carrier of validCarriers) {
      try {
        // Controlla se il carrier già esiste
        const existingCarrier = await Carrier.findOne({ name: carrier.name });
        
        if (existingCarrier) {
          // Aggiorna il carrier esistente
          existingCarrier.logoUrl = carrier.logoUrl;
          existingCarrier.isVolumetric = carrier.isVolumetric;
          existingCarrier.fuelSurcharge = carrier.fuelSurcharge;
          existingCarrier.isActive = carrier.isActive;
          
          await existingCarrier.save();
          results.success.push(`Carrier '${carrier.name}' aggiornato con successo`);
        } else {
          // Crea un nuovo carrier
          const newCarrier = new Carrier(carrier);
          await newCarrier.save();
          results.success.push(`Carrier '${carrier.name}' creato con successo`);
        }
      } catch (error) {
        results.errors.push(`Errore durante il salvataggio del carrier '${carrier.name}': ${error.message}`);
      }
    }
    
    // Elimina il file caricato
    await fs.unlink(req.file.path);
    
    // Invia i risultati
    return res.status(201).json({
      message: `Importazione completata: ${results.success.length} carrier importati, ${results.errors.length} errori`,
      results
    });
  } catch (error) {
    // In caso di errore, assicurati di eliminare il file
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    return res.status(500).json({ message: `Errore durante l'importazione: ${error.message}` });
  }
});

module.exports = router; 