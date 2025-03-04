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
  const validCarriers = [];
  const errors = [];

  carriers.forEach((carrier, index) => {
    // Validazione dei campi obbligatori
    if (!carrier.name) {
      errors.push(`Riga ${index + 2}: Nome del carrier mancante`);
      return;
    }
    
    // Trasforma i campi booleani
    const isVolumetric = carrier.isVolumetric && 
      (carrier.isVolumetric.toLowerCase() === 'true' || carrier.isVolumetric === '1');
    
    const isActive = carrier.isActive === undefined ? true : 
      (carrier.isActive.toLowerCase() === 'true' || carrier.isActive === '1');
    
    // Converte fuelSurcharge in numero
    const fuelSurcharge = carrier.fuelSurcharge ? parseFloat(carrier.fuelSurcharge) : 0;
    
    if (isNaN(fuelSurcharge)) {
      errors.push(`Riga ${index + 2}: Valore fuelSurcharge non valido per ${carrier.name}`);
      return;
    }
    
    // Carrier valido
    validCarriers.push({
      name: carrier.name.trim(),
      logoUrl: carrier.logoUrl ? carrier.logoUrl.trim() : '/images/carriers/default.png',
      isVolumetric,
      fuelSurcharge,
      isActive,
      services: [],
      volumeDiscounts: [],
      additionalFees: [],
      promotions: []
    });
  });

  return { validCarriers, errors };
};

module.exports = {
  parseCSV,
  validateCarriersData
}; 