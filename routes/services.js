// routes/services.js - Service routes
const express = require('express');
const router = express.Router();
const { loadModel } = require('../utils/modelLoader');
const Service = loadModel('Service');
const asyncHandler = require('express-async-handler');

// @desc    Get all services, optionally filtered by carrier
// @route   GET /api/services
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const query = {};
  
  // Se è specificato un carrier, filtra per quel carrier
  if (req.query.carrier) {
    query.carrier = req.query.carrier;
  }
  
  // Se è specificato un tipo di destinazione, filtra per quel tipo
  if (req.query.destinationType) {
    query.destinationType = req.query.destinationType;
  }
  
  // Se è specificato un paese di destinazione, filtra per quel paese
  if (req.query.destinationCountry) {
    query.destinationCountry = req.query.destinationCountry;
  }
  
  const services = await Service.find(query).populate('carrier', 'name logoUrl');
  
  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
}));

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('carrier', 'name logoUrl');
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  res.status(200).json({
    success: true,
    data: service
  });
}));

// @desc    Get services by carrier
// @route   GET /api/services/carrier/:carrierId
// @access  Private
router.get('/carrier/:carrierId', asyncHandler(async (req, res) => {
  const services = await Service.find({ carrier: req.params.carrierId, isActive: true })
    .populate('carrier', 'name logoUrl');
  
  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
}));

module.exports = router; 