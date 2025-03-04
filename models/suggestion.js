const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['price_optimization', 'cross_sell', 'upsell', 'retention', 'custom'],
    required: true
  },
  carrierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
  priority: {
    type: Number,
    default: 1,  // 1 = alta, 2 = media, 3 = bassa
    min: 1,
    max: 3
  },
  applied: {
    type: Boolean,
    default: false
  },
  dismissed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  }
});

// Indici per ricerche più veloci
suggestionSchema.index({ type: 1 });
suggestionSchema.index({ carrierId: 1 });
suggestionSchema.index({ applied: 1, dismissed: 1 });

// Metodo statico per trovare suggerimenti attivi
suggestionSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    dismissed: false,
    applied: false,
    $or: [
      { validUntil: { $gt: now } },
      { validUntil: null }
    ]
  }).sort({ priority: 1 });
};

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

module.exports = Suggestion; 