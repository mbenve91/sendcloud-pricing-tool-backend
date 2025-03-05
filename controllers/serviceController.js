const asyncHandler = require('../middleware/asyncHandler');
const Service = require('../models/Service');
const Carrier = require('../models/Carrier');
const ErrorResponse = require('../utils/errorResponse');

// Elenco di codici paesi EU
const EU_COUNTRIES = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
                      'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
                      'SI', 'ES', 'SE'];

// @desc    Get all services
// @route   GET /api/services
// @access  Private
exports.getServices = asyncHandler(async (req, res) => {
  const { carrierId } = req.query;
  
  let query = {};
  
  // Filtra per carrier specifico se richiesto
  if (carrierId) {
    query.carrier = carrierId;
  }
  
  const services = await Service.find(query).populate('carrier', 'name logoUrl');
  
  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('carrier', 'name logoUrl');
  
  if (!service) {
    return next(new ErrorResponse(`Service with id ${req.params.id} not found`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private
exports.createService = asyncHandler(async (req, res, next) => {
  // Verifica se esiste il carrier
  const carrier = await Carrier.findById(req.body.carrier);
  if (!carrier) {
    return next(new ErrorResponse(`Carrier with id ${req.body.carrier} not found`, 404));
  }
  
  // Controlla se il paese di destinazione è nell'UE
  if (req.body.destinationCountry) {
    const countryCode = req.body.destinationCountry.toUpperCase();
    req.body.isEU = EU_COUNTRIES.includes(countryCode);
  }
  
  const service = await Service.create(req.body);
  
  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new ErrorResponse(`Service with id ${req.params.id} not found`, 404));
  }
  
  // Controlla se il paese di destinazione è nell'UE quando viene aggiornato
  if (req.body.destinationCountry) {
    const countryCode = req.body.destinationCountry.toUpperCase();
    req.body.isEU = EU_COUNTRIES.includes(countryCode);
  }
  
  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new ErrorResponse(`Service with id ${req.params.id} not found`, 404));
  }
  
  await service.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}); 