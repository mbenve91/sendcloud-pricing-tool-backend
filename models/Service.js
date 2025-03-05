// models/Service.js
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  carrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    required: [true, 'Carrier is required']
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  deliveryTimeMin: {
    type: Number,
    default: null
  },
  deliveryTimeMax: {
    type: Number,
    default: null
  },
  destinationType: {
    type: String,
    enum: ['national', 'international', 'both'],
    default: 'national'
  },
  destinationCountry: {
    type: String,
    default: null
  },
  isEU: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuale per riferimento alle tariffe
ServiceSchema.virtual('rates', {
  ref: 'Rate',
  localField: '_id',
  foreignField: 'service'
});

// Indici per query veloci
ServiceSchema.index({ carrier: 1, code: 1 });
ServiceSchema.index({ destinationType: 1, destinationCountry: 1 });

module.exports = mongoose.model('Service', ServiceSchema);