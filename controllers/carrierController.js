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
    
    const carrierData = carriers;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Analizza queste informazioni per trovare la migliore tariffa di spedizione e fornisci una risposta in formato JSON con la seguente struttura:

{
  "carrierName": "nome del corriere consigliato",
  "serviceName": "nome del servizio specifico",
  "basePrice": numero,
  "suggestedPrice": numero,
  "purchasePrice": numero,
  "margin": numero,
  "monthlyProfit": numero,
  "monthlySavings": numero,
  "weightRange": {
    "min": numero,
    "max": numero
  },
  "fuelSurcharge": numero,
  "isVolumetric": boolean,
  "explanation": "breve spiegazione della scelta"
}

Dati Cliente:
- Spedizioni mensili: ${monthlyShipments}
- Peso medio: ${averageWeight}kg
- Mercato verticale: ${verticalMarket}
- Corriere attuale: ${currentCourier}
- Richiede peso volumetrico: ${isVolumetric ? 'Sì' : 'No'}

Dati Corrieri:
${JSON.stringify(carrierData, null, 2)}

Considera:
1. Compatibilità del peso con i range disponibili
2. Supporto per peso volumetrico se richiesto
3. Massimizzazione del margine mensile considerando:
   - Prezzo di acquisto (purchasePrice)
   - Prezzo di vendita suggerito (suggestedPrice)
   - Sovrattassa carburante (fuelSurcharge)
4. Competitività rispetto al corriere attuale
5. Specifiche esigenze del mercato verticale
6. Calcola:
   - monthlyProfit = (suggestedPrice - purchasePrice) * monthlyShipments
   - monthlySavings = confronto con i prezzi del corriere attuale

La risposta deve essere SOLO il JSON, senza altro testo.`
      }]
    });

    // Parse la risposta JSON di Claude
    const recommendation = JSON.parse(message.content[0].text);
    
    res.json(recommendation);
  } catch (error) {
    console.error('Errore nell\'analisi delle tariffe:', error);
    res.status(500).json({ 
      message: 'Errore nell\'analisi delle tariffe',
      error: error.message 
    });
  }
};

module.exports = {
  getAllCarriers,
  calculateBestRate,
  analyzeTariffs
};