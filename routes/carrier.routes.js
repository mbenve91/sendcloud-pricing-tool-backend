const express = require('express');
const router = express.Router();
const { getAllCarriers, calculateBestRate, analyzeTariffs } = require('../controllers/carrierController');

// GET /api/carriers - Get all carriers
router.get('/', getAllCarriers);

// POST /api/carriers/calculate - Calculate best rate
router.post('/calculate', calculateBestRate);

// POST /api/carriers/analyze - Analyze tariffs
router.post('/analyze', analyzeTariffs);

module.exports = router;