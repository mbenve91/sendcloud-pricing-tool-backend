const mongoose = require('mongoose');

const carrierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  logoUrl: {
    type: String,
    default: '/images/carriers/default.png'
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
    code: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    deliveryTimeMin: {
      type: Number  // in hours
    },
    deliveryTimeMax: {
      type: Number  // in hours
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
        default: null  // applicable for specific countries
      },
      weightRanges: [{
        min: {
          type: Number,
          required: true
        },
        max: {
          type: Number,
          required: true
        },
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
      }]
    }]
  }],
  volumeDiscounts: [{
    minVolume: {
      type: Number,
      required: true
    },
    maxVolume: {
      type: Number
    },
    discountPercentage: {
      type: Number,
      required: true
    },
    applicableServices: [{
      type: String  // service code
    }]
  }],
  additionalFees: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    fee: {
      type: Number,
      required: true
    },
    applicableServices: [{
      type: String  // service code
    }]
  }],
  promotions: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    discountPercentage: {
      type: Number,
      required: true
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
      type: String  // service code
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Metodo per calcolare il prezzo finale includendo sconti per volume e promozioni
carrierSchema.methods.calculateFinalPrice = function(serviceCode, weight, destinationType, countryCode, volume) {
  // Trova il servizio appropriato
  const service = this.services.find(s => s.code === serviceCode);
  if (!service) return null;
  
  // Prima cerca un pricing specifico per il paese
  let pricing = null;
  
  if (countryCode) {
    // Cerca prima un pricing specifico per il paese
    pricing = service.pricing.find(p => 
      p.destinationType === destinationType && 
      p.countryCode === countryCode
    );
  }
  
  // Se non trova un pricing specifico per il paese, cerca un pricing generale per il tipo di destinazione
  if (!pricing) {
    pricing = service.pricing.find(p => 
      p.destinationType === destinationType && 
      p.countryCode === null
    );
  }
  
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