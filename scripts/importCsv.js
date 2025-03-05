// scripts/importCsv.js - Script to import data from CSV files
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');
const { parseBRTCSV } = require('../utils/csvParser');
const Carrier = require('../models/Carrier');
const Rate = require('../models/Rate');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

/**
 * Import BRT data from CSV file
 * @param {string} filePath - Path to the CSV file
 */
const importBRTData = async (filePath) => {
  try {
    console.log(`Starting import from ${filePath}...`);
    
    // Parse the CSV file
    const data = await parseBRTCSV(filePath);
    console.log(`Found ${data.length} records to import`);
    
    if (data.length === 0) {
      console.log('No data found in CSV file');
      return;
    }
    
    // Get carrier information from the first row
    const carrierData = {
      name: data[0].carrier_name,
      logoUrl: data[0].logo_url,
      isActive: data[0].is_active,
      fuelSurcharge: data[0].fuel_surcharge,
      isVolumetric: data[0].is_volumetric
    };
    
    // Create or update the carrier
    console.log(`Processing carrier: ${carrierData.name}`);
    let carrier = await Carrier.findOne({ name: carrierData.name });
    
    if (!carrier) {
      console.log(`Creating new carrier: ${carrierData.name}`);
      carrier = await Carrier.create(carrierData);
    } else {
      console.log(`Updating existing carrier: ${carrierData.name}`);
      Object.assign(carrier, carrierData);
      await carrier.save();
    }
    
    // Process each rate record
    console.log('Processing rate records...');
    const operations = data.map(async (record) => {
      const rateData = {
        carrier: carrier._id,
        serviceName: record.service_name,
        serviceCode: record.service_code,
        serviceDescription: record.service_description,
        deliveryTimeMin: record.delivery_time_min,
        deliveryTimeMax: record.delivery_time_max,
        destinationType: record.destination_type,
        destinationCountry: record.destination_country,
        weightMin: record.weight_min,
        weightMax: record.weight_max,
        purchasePrice: record.purchase_price,
        retailPrice: record.retail_price
      };
      
      // Find existing rate or create new one
      const existingRate = await Rate.findOne({
        carrier: carrier._id,
        serviceCode: record.service_code,
        weightMin: record.weight_min,
        weightMax: record.weight_max,
        destinationType: record.destination_type,
        destinationCountry: record.destination_country
      });
      
      if (existingRate) {
        console.log(`Updating rate for ${record.service_name}, weight range ${record.weight_min}-${record.weight_max}kg`);
        Object.assign(existingRate, rateData);
        return existingRate.save();
      } else {
        console.log(`Creating new rate for ${record.service_name}, weight range ${record.weight_min}-${record.weight_max}kg`);
        return Rate.create(rateData);
      }
    });
    
    await Promise.all(operations);
    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

// Check for file path argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a path to the CSV file');
  console.log('Usage: node importCsv.js <path-to-csv>');
  process.exit(1);
}

// Run the import
importBRTData(path.resolve(filePath));