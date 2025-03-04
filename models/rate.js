const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  carrierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Carrier',
    required: true
  },
  serviceCode: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  fuelSurcharge: {
    type: Number,
    default: 0
  },
  volumeDiscount: {
    type: Number,
    default: 0
  },
  promotionDiscount: {
    type: Number,
    default: 0
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  marginDiscount: {
    type: Number,
    default: 0,
    min: 0,
    max: 90
  },
  weight: {
    type: Number,
    required: true
  },
  destinationType: {
    type: String,
    enum: ['national', 'eu', 'extra_eu'],
    required: true
  },
  destinationCountry: {
    type: String
  },
  deliveryTimeMin: {
    type: Number
  },
  deliveryTimeMax: {
    type: Number
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indici per ricerche più veloci
rateSchema.index({ carrierId: 1, serviceCode: 1 });
rateSchema.index({ destinationType: 1, weight: 1 });

// Metodo virtuale per calcolare il prezzo finale dopo tutti gli sconti
rateSchema.virtual('finalPrice').get(function() {
  const totalBasePrice = this.basePrice + (this.basePrice * this.fuelSurcharge / 100);
  const totalDiscountAmount = totalBasePrice * (this.volumeDiscount + this.promotionDiscount) / 100;
  const priceAfterDiscount = totalBasePrice - totalDiscountAmount;
  
  // Calcola il prezzo di vendita personalizzato se è stato applicato uno sconto sul margine
  return this.marginDiscount > 0 
    ? this.customSellingPrice 
    : priceAfterDiscount;
});

// Metodo virtuale per calcolare il margine attuale
rateSchema.virtual('actualMargin').get(function() {
  const finalPrice = this.finalPrice;
  return ((finalPrice - this.purchasePrice) / finalPrice) * 100;
});

// Metodo virtuale per calcolare il margine rimanente dopo lo sconto
rateSchema.virtual('remainingMargin').get(function() {
  if (this.marginDiscount === 0) return this.actualMargin;
  
  const customSellingPrice = this.customSellingPrice || this.sellingPrice * (1 - this.marginDiscount / 100);
  return ((customSellingPrice - this.purchasePrice) / customSellingPrice) * 100;
});

// Metodo virtuale per calcolare il prezzo di vendita personalizzato
rateSchema.virtual('customSellingPrice').get(function() {
  if (this.marginDiscount === 0) return this.sellingPrice;
  
  const margin = this.sellingPrice - this.purchasePrice;
  const discountedMargin = margin * (1 - this.marginDiscount / 100);
  return this.purchasePrice + discountedMargin;
});

// Metodo virtuale per calcolare la percentuale totale di sconto
rateSchema.virtual('totalDiscountPercentage').get(function() {
  return this.volumeDiscount + this.promotionDiscount;
});

// Pre-save hook per aggiornare il campo updatedAt
rateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Rate = mongoose.model('Rate', rateSchema);

module.exports = Rate; 