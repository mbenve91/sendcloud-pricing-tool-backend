const express = require('express');
const router = express.Router();
const { getAllCarriers, calculateBestRate } = require('../controllers/carrierController');

// GET /api/carriers - Get all carriers
router.get('/', getAllCarriers);

// POST /api/carriers/calculate - Calculate best rate
router.post('/calculate', calculateBestRate);

module.exports = router;