// routes/carriers.js - Carrier routes
const express = require('express');
const router = express.Router();
const {
  getCarriers,
  getCarrier,
  createCarrier,
  updateCarrier,
  deleteCarrier
} = require('../controllers/carrierController');

// Main routes
router.route('/')
  .get(getCarriers)
  .post(createCarrier);

router.route('/:id')
  .get(getCarrier)
  .put(updateCarrier)
  .delete(deleteCarrier);

module.exports = router;