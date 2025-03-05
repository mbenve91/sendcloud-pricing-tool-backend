// models/Carrier.js
const mongoose = require('mongoose');

const CarrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide carrier name'],
    trim: true,
    unique: true
  },
  logoUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fuelSurcharge: {
    type: Number,
    default: 0
  },
  isVolumetric: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Virtuale per riferimento ai servizi
CarrierSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'carrier'
});

module.exports = mongoose.model('Carrier', CarrierSchema);