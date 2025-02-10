const mongoose = require('mongoose');

const carrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isVolumetric: {
    type: Boolean,
    required: true
  },
  fuelSurcharge: {
    type: Number,
    default: 0
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    weightRange: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      }
    },
    pricing: {
      retailPrice: {
        type: Number,
        required: true
      },
      purchasePrice: {
        type: Number,
        required: true
      },
      margin: {
        type: Number,
        required: true
      }
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Carrier', carrierSchema);