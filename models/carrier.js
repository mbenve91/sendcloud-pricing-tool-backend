// models/Carrier.js - Carrier schema definition
const mongoose = require('mongoose');

const CarrierSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Carrier', CarrierSchema);