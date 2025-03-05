// models/Rate.js
const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  weightMin: {
    type: Number,
    required: [true, 'Minimum weight is required']
  },
  weightMax: {
    type: Number,
    required: [true, 'Maximum weight is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required']
  },
  retailPrice: {
    type: Number,
    required: [true, 'Retail price is required']
  },
  margin: {
    type: Number,
    default: function() {
      return this.retailPrice - this.purchasePrice;
    }
  },
  marginPercentage: {
    type: Number,
    default: function() {
      if (this.retailPrice === 0) return 0;
      return ((this.retailPrice - this.purchasePrice) / this.retailPrice) * 100;
    }
  },
  volumeDiscount: {
    type: Number,
    default: 0
  },
  promotionalDiscount: {
    type: Number,
    default: 0
  },
  minimumVolume: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validazione
RateSchema.pre('save', function(next) {
  // Validazione range di peso
  if (this.weightMin >= this.weightMax) {
    return next(new Error('Minimum weight must be less than maximum weight'));
  }
  
  // Validazione prezzi
  if (this.purchasePrice > this.retailPrice) {
    return next(new Error('Purchase price should not exceed retail price'));
  }
  
  next();
});

// Indici per query veloci
RateSchema.index({ service: 1 });
RateSchema.index({ weightMin: 1, weightMax: 1 });

module.exports = mongoose.model('Rate', RateSchema);