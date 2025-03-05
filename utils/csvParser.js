// utils/csvParser.js - Utility for parsing CSV files
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

/**
 * Parse a CSV file with semicolon-separated values
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of parsed objects
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv({ 
        separator: ';',
        mapHeaders: ({ header }) => header.trim() 
      }))
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
 * Parse a BRT CSV file with the specific format
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of parsed and structured objects
 */
const parseBRTCSV = async (filePath) => {
  try {
    const rawData = await parseCSV(filePath);
    
    // Transform the raw data into structured objects
    return rawData.map(row => {
      // Handle the single column with all values
      const values = Object.values(row)[0].split(';');
      
      // Map to our structured object based on known positions
      return {
        carrier_name: values[0] || '',
        logo_url: values[1] || null,
        is_volumetric: values[2] === 'true',
        fuel_surcharge: parseFloat(values[3] || 0),
        is_active: values[4] === 'true',
        service_name: values[5] || '',
        service_code: values[6] || '',
        service_description: values[7] || '',
        delivery_time_min: parseInt(values[8] || 0, 10),
        delivery_time_max: parseInt(values[9] || 0, 10),
        destination_type: values[10] || 'national',
        destination_country: values[11] || null,
        weight_min: parseFloat(values[12] || 0),
        weight_max: parseFloat(values[13] || 0),
        purchase_price: parseFloat(values[14] || 0),
        retail_price: parseFloat(values[15] || 0)
      };
    });
  } catch (error) {
    console.error('Error parsing BRT CSV:', error);
    throw error;
  }
};

module.exports = {
  parseCSV,
  parseBRTCSV
};