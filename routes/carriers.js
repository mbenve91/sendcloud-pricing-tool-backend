const express = require('express');
const router = express.Router();
const Carrier = require('../models/carrier');

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

module.exports = router; 