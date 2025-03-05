// routes/rates.js - Rate routes
const express = require('express');
const router = express.Router();
const {
  getRates,
  getRate,
  createRate,
  updateRate,
  deleteRate,
  compareRates,
  getRatesByCarrier
} = require('../controllers/rateController');

// Compare rates route
router.route('/compare').get(compareRates);

// Get rates by carrier
router.route('/carrier/:carrierId').get(getRatesByCarrier);

// Main routes
router.route('/')
  .get(getRates)
  .post(createRate);

router.route('/:id')
  .get(getRate)
  .put(updateRate)
  .delete(deleteRate);

module.exports = router;