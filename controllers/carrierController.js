const Anthropic = require('@anthropic-ai/sdk');
const Carrier = require('../models/carrier');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY // Usa solo la variabile d'ambiente
});

// Get all carriers
const getAllCarriers = async (req, res) => {
  try {
    const carriers = await Carrier.find();
    res.json(carriers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate best rate
const calculateBestRate = async (req, res) => {
  try {
    const { weight, isVolumetric } = req.body;
    const carriers = await Carrier.find();
    
    let bestRate = null;
    let bestCarrier = null;

    carriers.forEach(carrier => {
      carrier.services.forEach(service => {
        if (weight >= service.weightRange.min && weight <= service.weightRange.max) {
          // Se il cliente richiede peso volumetrico, considera solo i corrieri che lo supportano
          if (isVolumetric && !carrier.isVolumetric) return;

          const totalPrice = service.pricing.retailPrice * (1 + carrier.fuelSurcharge/100);
          
          if (!bestRate || totalPrice < bestRate) {
            bestRate = totalPrice;
            bestCarrier = {
              carrier: carrier.name,
              service: service.name,
              basePrice: service.pricing.retailPrice,
              fuelSurcharge: carrier.fuelSurcharge,
              totalPrice: totalPrice,
              margin: service.pricing.margin
            };
          }
        }
      });
    });

    if (!bestRate) {
      return res.status(404).json({ message: 'No suitable service found for this weight' });
    }

    res.json(bestCarrier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const analyzeTariffs = async (req, res) => {
  try {
    const { monthlyShipments, averageWeight, isVolumetric, verticalMarket, currentCourier } = req.body;
    const carriers = await Carrier.find();
    
    // Chiedi all'IA solo per la raccomandazione iniziale
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Analyze this shipping information to find the best rate, considering that:

1. The suggested price should be an optimal compromise between:
   - Maximizing company margin
   - Attractive savings for the prospect
   - Long-term sustainability of the business relationship

2. Sales can apply up to 90% discount on margin to close the deal, but the suggested price should already be competitive without requiring excessive discounts.

3. Consider:
   - Monthly volume: ${monthlyShipments} shipments
   - Average weight: ${averageWeight}kg
   - Market: ${verticalMarket}
   - Current courier: ${currentCourier}
   - Volumetric requirements: ${isVolumetric ? 'Yes' : 'No'}

Provide a response in JSON format with this structure:
{
  "carrierName": "recommended carrier name",
  "serviceName": "specific service name",
  "basePrice": number,
  "suggestedPrice": number,
  "purchasePrice": number,
  "margin": number,
  "monthlyProfit": number,
  "monthlySavings": number,
  "weightRange": {
    "min": number,
    "max": number
  },
  "fuelSurcharge": number,
  "isVolumetric": boolean,
  "explanation": "Explain why this is the optimal solution, including the reasoning behind the suggested price"
}

Carriers Data:
${JSON.stringify(carriers, null, 2)}

The response must be ONLY the JSON, without any other text.`
      }]
    });

    const recommendation = JSON.parse(message.content[0].text);
    
    // Prepara i dati di tutti i corrieri disponibili
    const carriersData = carriers.map(carrier => ({
      id: carrier._id,
      name: carrier.name,
      services: carrier.services.map(service => ({
        range: `${service.weightRange.min}-${service.weightRange.max}kg`,
        retailPrice: service.pricing.retailPrice,
        purchasePrice: service.pricing.purchasePrice,
        margin: service.pricing.margin,
        weightRange: service.weightRange
      })),
      fuelSurcharge: carrier.fuelSurcharge,
      isVolumetric: carrier.isVolumetric
    }));

    const response = {
      recommendation,
      carriersData,
      monthlyShipments,
      maxDiscount: recommendation.margin * 0.9
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error analyzing tariffs:', error);
    res.status(500).json({ 
      message: 'Error analyzing tariffs',
      error: error.message 
    });
  }
};

module.exports = {
  getAllCarriers,
  calculateBestRate,
  analyzeTariffs
};