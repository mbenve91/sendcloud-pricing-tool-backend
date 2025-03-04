const express = require('express');
const router = express.Router();
const Suggestion = require('../models/suggestion');
const Carrier = require('../models/carrier');

// GET - Ottieni tutti i suggerimenti attivi
router.get('/', async (req, res) => {
  try {
    // Usa il metodo statico definito nel modello per trovare i suggerimenti attivi
    const suggestions = await Suggestion.findActive();
    
    // Aggiungiamo le informazioni del carrier per ogni suggerimento
    const suggestionsWithCarrier = await Promise.all(suggestions.map(async (suggestion) => {
      if (suggestion.carrierId) {
        const carrier = await Carrier.findById(suggestion.carrierId).select('name logoUrl');
        return {
          id: suggestion._id,
          type: suggestion.type,
          carrierId: suggestion.carrierId,
          carrierName: carrier ? carrier.name : null,
          message: suggestion.message,
          details: suggestion.details,
          priority: suggestion.priority,
          createdAt: suggestion.createdAt,
          validUntil: suggestion.validUntil
        };
      } else {
        return {
          id: suggestion._id,
          type: suggestion.type,
          message: suggestion.message,
          details: suggestion.details,
          priority: suggestion.priority,
          createdAt: suggestion.createdAt,
          validUntil: suggestion.validUntil
        };
      }
    }));
    
    res.json(suggestionsWithCarrier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Ottieni un suggerimento specifico per ID
router.get('/:id', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggerimento non trovato' });
    }
    
    // Aggiungiamo le informazioni del carrier se presente
    let result;
    if (suggestion.carrierId) {
      const carrier = await Carrier.findById(suggestion.carrierId).select('name logoUrl');
      result = {
        id: suggestion._id,
        type: suggestion.type,
        carrierId: suggestion.carrierId,
        carrierName: carrier ? carrier.name : null,
        message: suggestion.message,
        details: suggestion.details,
        priority: suggestion.priority,
        applied: suggestion.applied,
        dismissed: suggestion.dismissed,
        createdAt: suggestion.createdAt,
        validUntil: suggestion.validUntil
      };
    } else {
      result = {
        id: suggestion._id,
        type: suggestion.type,
        message: suggestion.message,
        details: suggestion.details,
        priority: suggestion.priority,
        applied: suggestion.applied,
        dismissed: suggestion.dismissed,
        createdAt: suggestion.createdAt,
        validUntil: suggestion.validUntil
      };
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Crea un nuovo suggerimento
router.post('/', async (req, res) => {
  try {
    // Verifica che il carrier esista se è specificato
    if (req.body.carrierId) {
      const carrier = await Carrier.findById(req.body.carrierId);
      if (!carrier) {
        return res.status(404).json({ message: 'Carrier non trovato' });
      }
    }
    
    const suggestion = new Suggestion({
      type: req.body.type,
      carrierId: req.body.carrierId,
      message: req.body.message,
      details: req.body.details,
      priority: req.body.priority || 1,
      validUntil: req.body.validUntil
    });

    const newSuggestion = await suggestion.save();
    res.status(201).json(newSuggestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH - Marca un suggerimento come applicato
router.patch('/:id/apply', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggerimento non trovato' });
    }

    suggestion.applied = true;
    const updatedSuggestion = await suggestion.save();
    res.json(updatedSuggestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH - Marca un suggerimento come respinto
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggerimento non trovato' });
    }

    suggestion.dismissed = true;
    const updatedSuggestion = await suggestion.save();
    res.json(updatedSuggestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Elimina un suggerimento
router.delete('/:id', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggerimento non trovato' });
    }

    await suggestion.deleteOne();
    res.json({ message: 'Suggerimento eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 