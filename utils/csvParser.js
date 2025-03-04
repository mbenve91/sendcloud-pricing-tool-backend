const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parsa un file CSV e restituisce un array di oggetti
 * @param {string} filePath - Percorso del file CSV
 * @returns {Promise<Array>} - Array di oggetti estratti dal CSV
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Valida i dati dei carriers estratti dal CSV
 * @param {Array} carriers - Array di carrier da validare
 * @returns {Object} - Objeto con i carrier validi e gli errori
 */
const validateCarriersData = (carriers) => {
  const validCarriers = {};
  const errors = [];

  carriers.forEach((row, index) => {
    // Gestisci i nomi delle colonne vecchie e nuove
    const carrierName = row.carrier_name || row.name;
    const logoUrl = row.logo_url || row.logoUrl;
    const isVolumetric = row.is_volumetric || row.isVolumetric;
    const fuelSurcharge = row.fuel_surcharge || row.fuelSurcharge;
    const isActive = row.is_active || row.isActive;
    
    // Validazione dei campi obbligatori di base
    if (!carrierName) {
      errors.push(`Riga ${index + 2}: Nome del carrier mancante`);
      return;
    }
    
    // Trasforma i campi booleani
    const isVolumetricBool = isVolumetric && 
      (isVolumetric.toLowerCase() === 'true' || isVolumetric === '1');
    
    const isActiveBool = isActive === undefined ? true : 
      (isActive.toLowerCase() === 'true' || isActive === '1');
    
    // Converte fuelSurcharge in numero
    const fuelSurchargeNum = fuelSurcharge ? parseFloat(fuelSurcharge) : 0;
    
    if (isNaN(fuelSurchargeNum)) {
      errors.push(`Riga ${index + 2}: Valore fuelSurcharge non valido per ${carrierName}`);
      return;
    }

    // Ottieni o crea il carrier
    if (!validCarriers[carrierName]) {
      validCarriers[carrierName] = {
        name: carrierName.trim(),
        logoUrl: logoUrl ? logoUrl.trim() : '/images/carriers/default.png',
        isVolumetric: isVolumetricBool,
        fuelSurcharge: fuelSurchargeNum,
        isActive: isActiveBool,
        services: [],
        volumeDiscounts: [],
        additionalFees: [],
        promotions: []
      };
    }

    // Se abbiamo informazioni sul servizio, aggiungiamole
    if (row.service_name) {
      // Trova o crea il servizio
      let service = validCarriers[carrierName].services.find(s => s.name === row.service_name);
      
      if (!service) {
        service = {
          name: row.service_name,
          code: row.service_code || row.service_name.substring(0, 3).toUpperCase(),
          description: row.service_description || `Servizio ${row.service_name}`,
          deliveryTimeMin: parseInt(row.delivery_time_min) || 24,
          deliveryTimeMax: parseInt(row.delivery_time_max) || 48,
          destinationTypes: [],
          pricing: []
        };
        validCarriers[carrierName].services.push(service);
      }

      // Aggiungi il tipo di destinazione se non esiste già
      const destinationType = row.destination_type || 'national';
      if (!service.destinationTypes.includes(destinationType)) {
        service.destinationTypes.push(destinationType);
      }

      // Trova o crea il pricing per questo tipo di destinazione
      let pricing = service.pricing.find(p => p.destinationType === destinationType && 
                                           p.countryCode === (row.destination_country || null));
      
      if (!pricing) {
        pricing = {
          destinationType,
          countryCode: row.destination_country || null,
          weightRanges: []
        };
        service.pricing.push(pricing);
      }

      // Aggiungi la fascia di peso se sono specificate
      if (row.weight_min !== undefined && row.weight_max !== undefined && 
          row.purchase_price !== undefined && row.retail_price !== undefined) {
        
        const weightMin = parseFloat(row.weight_min);
        const weightMax = parseFloat(row.weight_max);
        const purchasePrice = parseFloat(row.purchase_price);
        const retailPrice = parseFloat(row.retail_price);
        
        // Calcola il margine
        const margin = ((retailPrice - purchasePrice) / retailPrice) * 100;
        
        if (!isNaN(weightMin) && !isNaN(weightMax) && !isNaN(purchasePrice) && !isNaN(retailPrice)) {
          pricing.weightRanges.push({
            min: weightMin,
            max: weightMax,
            retailPrice,
            purchasePrice,
            margin: parseFloat(margin.toFixed(2))
          });
        } else {
          errors.push(`Riga ${index + 2}: Valori numerici non validi per la fascia di peso o prezzi`);
        }
      }
    }
  });

  // Converti l'oggetto dei carrier in un array
  const carrierArray = Object.values(validCarriers);
  
  return { validCarriers: carrierArray, errors };
};

module.exports = {
  parseCSV,
  validateCarriersData
}; 