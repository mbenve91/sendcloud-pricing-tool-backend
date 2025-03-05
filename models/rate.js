// models/Rate.js - Rate schema definition
const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema(
  {
    carrier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Carrier',
      required: [true, 'Carrier is required']
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true
    },
    serviceCode: {
      type: String,
      trim: true
    },
    serviceDescription: {
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for faster queries
RateSchema.index({ carrier: 1, serviceCode: 1 });
RateSchema.index({ weightMin: 1, weightMax: 1 });
RateSchema.index({ destinationType: 1, destinationCountry: 1 });

// Add method to calculate price for a specific weight
RateSchema.methods.calculatePriceForWeight = function(weight) {
  if (weight < this.weightMin || weight > this.weightMax) {
    return null;
  }
  return {
    purchasePrice: this.purchasePrice,
    retailPrice: this.retailPrice,
    margin: this.margin,
    marginPercentage: this.marginPercentage
  };
};

module.exports = mongoose.model('Rate', RateSchema);