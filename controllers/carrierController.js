// controllers/carrierController.js - Carrier CRUD operations
let Carrier;
try {
  // Prima prova con il percorso standard (per ambiente locale)
  Carrier = require('../models/Carrier.js');
} catch (error) {
  // Se fallisce, prova con il percorso assoluto (per ambiente Render)
  Carrier = require(process.cwd() + '/models/Carrier.js');
}
const asyncHandler = require('express-async-handler');

// @desc    Get all carriers
// @route   GET /api/carriers
// @access  Private
exports.getCarriers = asyncHandler(async (req, res) => {
  const carriers = await Carrier.find({ isActive: true });
  
  res.status(200).json({
    success: true,
    count: carriers.length,
    data: carriers
  });
});

// @desc    Get single carrier
// @route   GET /api/carriers/:id
// @access  Private
exports.getCarrier = asyncHandler(async (req, res) => {
  const carrier = await Carrier.findById(req.params.id);
  
  if (!carrier) {
    res.status(404);
    throw new Error('Carrier not found');
  }
  
  res.status(200).json({
    success: true,
    data: carrier
  });
});

// @desc    Create carrier
// @route   POST /api/carriers
// @access  Private/Admin
exports.createCarrier = asyncHandler(async (req, res) => {
  const carrier = await Carrier.create(req.body);
  
  res.status(201).json({
    success: true,
    data: carrier
  });
});

// @desc    Update carrier
// @route   PUT /api/carriers/:id
// @access  Private/Admin
exports.updateCarrier = asyncHandler(async (req, res) => {
  let carrier = await Carrier.findById(req.params.id);
  
  if (!carrier) {
    res.status(404);
    throw new Error('Carrier not found');
  }
  
  carrier = await Carrier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: carrier
  });
});

// @desc    Delete carrier
// @route   DELETE /api/carriers/:id
// @access  Private/Admin
exports.deleteCarrier = asyncHandler(async (req, res) => {
  const carrier = await Carrier.findById(req.params.id);
  
  if (!carrier) {
    res.status(404);
    throw new Error('Carrier not found');
  }
  
  // Soft delete by setting isActive to false
  carrier.isActive = false;
  await carrier.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});