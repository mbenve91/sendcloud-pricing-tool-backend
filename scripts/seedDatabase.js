const mongoose = require('mongoose');
require('dotenv').config();
const Carrier = require('../models/carrier');

const initialCarriers = [
  {
    name: "BRT",
    isVolumetric: false,
    fuelSurcharge: 6,
    services: [
      {
        name: "BRT Express 0-2kg",
        weightRange: { min: 0, max: 2 },
        pricing: {
          retailPrice: 5.50,
          purchasePrice: 4.49,
          margin: 1.01
        }
      },
      {
        name: "BRT Express 2-5kg",
        weightRange: { min: 2, max: 5 },
        pricing: {
          retailPrice: 5.80,
          purchasePrice: 4.79,
          margin: 1.01
        }
      },
      {
        name: "BRT Express 5-10kg",
        weightRange: { min: 5, max: 10 },
        pricing: {
          retailPrice: 8.19,
          purchasePrice: 7.18,
          margin: 1.01
        }
      },
      {
        name: "BRT Express 10-25kg",
        weightRange: { min: 10, max: 25 },
        pricing: {
          retailPrice: 11.36,
          purchasePrice: 10.35,
          margin: 1.01
        }
      },
      {
        name: "BRT Express 25-50kg",
        weightRange: { min: 25, max: 50 },
        pricing: {
          retailPrice: 18.18,
          purchasePrice: 16.16,
          margin: 2.02
        }
      }
    ]
  },
  {
    name: "GLS",
    isVolumetric: true,
    fuelSurcharge: 0,
    services: [
      {
        name: "GLS National Express 0-2kg",
        weightRange: { min: 0, max: 2 },
        pricing: {
          retailPrice: 5.04,
          purchasePrice: 4.20,
          margin: 0.84
        }
      },
      {
        name: "GLS National Express 2-5kg",
        weightRange: { min: 2, max: 5 },
        pricing: {
          retailPrice: 5.51,
          purchasePrice: 4.60,
          margin: 0.91
        }
      },
      {
        name: "GLS National Express 5-10kg",
        weightRange: { min: 5, max: 10 },
        pricing: {
          retailPrice: 7.73,
          purchasePrice: 6.50,
          margin: 1.23
        }
      },
      {
        name: "GLS National Express 10-30kg",
        weightRange: { min: 10, max: 30 },
        pricing: {
          retailPrice: 17.14,
          purchasePrice: 12.00,
          margin: 5.14
        }
      },
      {
        name: "GLS National Express 30-50kg",
        weightRange: { min: 30, max: 50 },
        pricing: {
          retailPrice: 24.29,
          purchasePrice: 17.00,
          margin: 7.29
        }
      }
    ]
  },
  {
    name: "Poste Italiane",
    isVolumetric: false,
    fuelSurcharge: 0,
    services: [
      {
        name: "Poste Delivery Business Standard Domicilio 0-2kg",
        weightRange: { min: 0, max: 2 },
        pricing: {
          retailPrice: 4.60,
          purchasePrice: 0.89,
          margin: 3.71
        }
      },
      {
        name: "Poste Delivery Business Standard Domicilio 2-5kg",
        weightRange: { min: 2, max: 5 },
        pricing: {
          retailPrice: 5.30,
          purchasePrice: 0.99,
          margin: 4.31
        }
      },
      {
        name: "Poste Delivery Business Standard Domicilio 5-10kg",
        weightRange: { min: 5, max: 10 },
        pricing: {
          retailPrice: 6.90,
          purchasePrice: 1.09,
          margin: 5.81
        }
      },
      {
        name: "Poste Delivery Business Standard Domicilio 10-20kg",
        weightRange: { min: 10, max: 20 },
        pricing: {
          retailPrice: 8.10,
          purchasePrice: 1.50,
          margin: 6.60
        }
      },
      {
        name: "Poste Delivery Business Standard Domicilio 20-30kg",
        weightRange: { min: 20, max: 30 },
        pricing: {
          retailPrice: 10.00,
          purchasePrice: 1.85,
          margin: 8.15
        }
      }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Carrier.deleteMany({});
    console.log('Cleared existing carriers');

    // Insert new data
    const result = await Carrier.insertMany(initialCarriers);
    console.log(`Inserted ${result.length} carriers`);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();