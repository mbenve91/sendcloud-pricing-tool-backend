// controllers/rateController.js - Rate operations
const Rate = require('../models/Rate');
const Carrier = require('../models/Carrier');
const asyncHandler = require('express-async-handler');

// @desc    Get all rates
// @route   GET /api/rates
// @access  Private
exports.getRates = asyncHandler(async (req, res) => {
  let query = {};
  
  // Build query from request query parameters
  if (req.query.carrier) {
    query.carrier = req.query.carrier;
  }
  
  if (req.query.serviceCode) {
    query.serviceCode = req.query.serviceCode;
  }
  
  if (req.query.destinationType) {
    query.destinationType = req.query.destinationType;
  }
  
  if (req.query.destinationCountry) {
    query.destinationCountry = req.query.destinationCountry;
  }
  
  const rates = await Rate.find(query).populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  res.status(200).json({
    success: true,
    count: rates.length,
    data: rates
  });
});

// @desc    Get rates for comparison based on weight, destination, etc.
// @route   GET /api/rates/compare
// @access  Private
exports.compareRates = asyncHandler(async (req, res) => {
  const { 
    weight, 
    destinationType = 'national', 
    destinationCountry = null,
    minMargin = 0 
  } = req.query;
  
  if (!weight) {
    res.status(400);
    throw new Error('Weight is required for rate comparison');
  }
  
  // Parse weight to number
  const weightNum = parseFloat(weight);
  
  // Build query to find applicable rates
  const query = {
    weightMin: { $lte: weightNum },
    weightMax: { $gte: weightNum },
    destinationType: destinationType === 'both' ? { $in: ['national', 'international', 'both'] } : { $in: [destinationType, 'both'] }
  };
  
  // Add destination country if provided
  if (destinationCountry) {
    query.destinationCountry = destinationCountry;
  }
  
  // Find all applicable rates
  const rates = await Rate.find(query)
    .populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  // Calculate actual margin and filter by minimum margin if specified
  const minMarginNum = parseFloat(minMargin);
  const filteredRates = rates.filter(rate => {
    const marginPercentage = ((rate.retailPrice - rate.purchasePrice) / rate.retailPrice) * 100;
    return marginPercentage >= minMarginNum;
  });
  
  // Sort by lowest retail price first
  const sortedRates = filteredRates.sort((a, b) => a.retailPrice - b.retailPrice);
  
  res.status(200).json({
    success: true,
    count: sortedRates.length,
    data: sortedRates
  });
});

// @desc    Get single rate
// @route   GET /api/rates/:id
// @access  Private
exports.getRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findById(req.params.id).populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  if (!rate) {
    res.status(404);
    throw new Error('Rate not found');
  }
  
  res.status(200).json({
    success: true,
    data: rate
  });
});

// @desc    Create rate
// @route   POST /api/rates
// @access  Private/Admin
exports.createRate = asyncHandler(async (req, res) => {
  // Check if carrier exists
  const carrier = await Carrier.findById(req.body.carrier);
  
  if (!carrier) {
    res.status(404);
    throw new Error('Carrier not found');
  }
  
  const rate = await Rate.create(req.body);
  
  res.status(201).json({
    success: true,
    data: rate
  });
});

// @desc    Update rate
// @route   PUT /api/rates/:id
// @access  Private/Admin
exports.updateRate = asyncHandler(async (req, res) => {
  let rate = await Rate.findById(req.params.id);
  
  if (!rate) {
    res.status(404);
    throw new Error('Rate not found');
  }
  
  rate = await Rate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: rate
  });
});

// @desc    Delete rate
// @route   DELETE /api/rates/:id
// @access  Private/Admin
exports.deleteRate = asyncHandler(async (req, res) => {
  const rate = await Rate.findById(req.params.id);
  
  if (!rate) {
    res.status(404);
    throw new Error('Rate not found');
  }
  
  await rate.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get rates by carrier
// @route   GET /api/rates/carrier/:carrierId
// @access  Private
exports.getRatesByCarrier = asyncHandler(async (req, res) => {
  const rates = await Rate.find({ carrier: req.params.carrierId })
    .populate('carrier', 'name logoUrl isVolumetric fuelSurcharge');
  
  res.status(200).json({
    success: true,
    count: rates.length,
    data: rates
  });
});