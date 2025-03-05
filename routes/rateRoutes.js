const express = require('express');
const rateController = require('../controllers/rateController');
const router = express.Router();

// Gestione delle rotte per le tariffe
router.get('/', rateController.getRates);
router.get('/compare', rateController.compareRates);
router.get('/carrier/:carrierId', rateController.getRatesByCarrier);
router.get('/service/:serviceId/weightRanges', rateController.getWeightRangesByService);
router.get('/:id', rateController.getRate);
router.post('/', rateController.createRate);
router.put('/:id', rateController.updateRate);
router.delete('/:id', rateController.deleteRate);

module.exports = router; 