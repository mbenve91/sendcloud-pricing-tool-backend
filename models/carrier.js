const mongoose = require('mongoose');

/**
 * Schema MongoDB per i corrieri e le loro tariffe di spedizione
 * Questo modello memorizza informazioni sui corrieri, i loro servizi e le tariffe
 * basate su intervalli di peso e destinazioni.
 */
const carrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logoUrl: {
    type: String,
    default: '/images/carriers/default.png'
  },
  isVolumetric: {
    type: Boolean,
    required: true,
    default: false
  },
  fuelSurcharge: {
    type: Number,
    default: 0,
    min: 0
  },
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    deliveryTimeMin: {
      type: Number  // in ore
    },
    deliveryTimeMax: {
      type: Number  // in ore
    },
    destinationTypes: [{
      type: String,
      enum: ['national', 'eu', 'extra_eu'],
      required: true
    }],
    pricing: [{
      destinationType: {
        type: String,
        enum: ['national', 'eu', 'extra_eu'],
        required: true
      },
      countryCode: {
        type: String,
        default: null  // applicabile per paesi specifici
      },
      weightRanges: [{
        min: {
          type: Number,
          required: true,
          min: 0
        },
        max: {
          type: Number,
          required: true,
          min: 0
        },
        retailPrice: {
          type: Number,
          required: true,
          min: 0
        },
        purchasePrice: {
          type: Number,
          required: true,
          min: 0
        },
        margin: {
          type: Number,
          required: true,
          min: 0
        }
      }]
    }]
  }],
  volumeDiscounts: [{
    minVolume: {
      type: Number,
      required: true,
      min: 1
    },
    maxVolume: {
      type: Number,
      min: 1
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    applicableServices: [{
      type: String  // codice servizio
    }]
  }],
  additionalFees: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    fee: {
      type: Number,
      required: true,
      min: 0
    },
    applicableServices: [{
      type: String  // codice servizio
    }]
  }],
  promotions: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    applicableServices: [{
      type: String  // codice servizio
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Metodo per calcolare il prezzo finale includendo sconti per volume e promozioni
 * @param {String} serviceCode - Codice del servizio
 * @param {Number} weight - Peso della spedizione in kg
 * @param {String} destinationType - Tipo di destinazione (national, eu, extra_eu)
 * @param {String} countryCode - Codice paese (opzionale)
 * @param {Number} volume - Volume mensile di spedizioni (opzionale)
 * @returns {Object} Dettagli del prezzo calcolato o null se non applicabile
 */
carrierSchema.methods.calculateFinalPrice = function(serviceCode, weight, destinationType, countryCode, volume) {
  // Trova il servizio appropriato
  const service = this.services.find(s => s.code === serviceCode);
  if (!service) return null;
  
  // Trova il pricing per la destinazione richiesta
  const pricing = service.pricing.find(p => 
    p.destinationType === destinationType && 
    (!countryCode || !p.countryCode || p.countryCode === countryCode)
  );
  if (!pricing) return null;
  
  // Trova il range di peso appropriato
  const weightRange = pricing.weightRanges.find(wr => 
    weight >= wr.min && weight <= wr.max
  );
  if (!weightRange) return null;
  
  // Prezzo base
  let basePrice = weightRange.retailPrice;
  
  // Aggiungi sovrapprezzo carburante
  const totalBasePrice = basePrice * (1 + this.fuelSurcharge/100);
  
  // Calcola sconto per volume se applicabile
  let volumeDiscount = 0;
  if (volume) {
    const applicableVolumeDiscount = this.volumeDiscounts
      .filter(vd => volume >= vd.minVolume && (!vd.maxVolume || volume <= vd.maxVolume))
      .filter(vd => !vd.applicableServices.length || vd.applicableServices.includes(serviceCode))
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
    
    if (applicableVolumeDiscount) {
      volumeDiscount = applicableVolumeDiscount.discountPercentage;
    }
  }
  
  // Calcola promozioni attive se presenti
  const currentDate = new Date();
  let promotionDiscount = 0;
  const activePromotion = this.promotions
    .filter(p => currentDate >= p.startDate && currentDate <= p.endDate)
    .filter(p => !p.applicableServices.length || p.applicableServices.includes(serviceCode))
    .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  
  if (activePromotion) {
    promotionDiscount = activePromotion.discountPercentage;
  }
  
  // Calcola il prezzo finale
  const totalDiscountPercentage = volumeDiscount + promotionDiscount;
  const finalPrice = totalBasePrice * (1 - totalDiscountPercentage/100);
  
  // Calcola il margine effettivo
  const actualCost = weightRange.purchasePrice;
  const actualMargin = ((finalPrice - actualCost) / finalPrice) * 100;
  
  return {
    basePrice,
    fuelSurcharge: this.fuelSurcharge,
    totalBasePrice,
    volumeDiscount,
    promotionDiscount,
    totalDiscountPercentage,
    finalPrice,
    actualMargin
  };
};

module.exports = mongoose.model('Carrier', carrierSchema); 