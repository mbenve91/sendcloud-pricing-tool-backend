# Backend per Sendcloud Pricing Tool

Questo repository contiene il backend per l'applicazione Sendcloud Pricing Tool. È costruito utilizzando Express.js e MongoDB.

## Prerequisiti

- Node.js (v14+)
- MongoDB (Cloud Atlas)

## Installazione

1. Clona il repository
2. Installa le dipendenze

```bash
npm install
```

3. Crea un file `.env` nella root del progetto con le seguenti variabili:

```
MONGODB_URI=<il-tuo-uri-mongodb>
PORT=5000
NODE_ENV=development
```

## Avvio dell'applicazione

Per avviare l'applicazione in modalità sviluppo:

```bash
npm run dev
```

Per avviare l'applicazione in produzione:

```bash
npm start
```

## Struttura dell'API

Il backend espone le seguenti API:

### Carriers

- `GET /api/carriers` - Ottieni tutti i carrier
- `GET /api/carriers/:id` - Ottieni un carrier specifico
- `POST /api/carriers` - Crea un nuovo carrier
- `PUT /api/carriers/:id` - Aggiorna un carrier esistente
- `DELETE /api/carriers/:id` - Elimina un carrier
- `GET /api/carriers/:id/services` - Ottieni tutti i servizi di un carrier

### Rates

- `GET /api/rates` - Ottieni tutte le tariffe (supporta filtri)
  - Parametri di query:
    - `carrierId` - Filtra per carrier
    - `destinationType` - Filtra per tipo di destinazione (national, eu, extra_eu)
    - `weight` - Trova tariffe per un peso specifico
    - `serviceCode` - Filtra per codice servizio
    - `destinationCountry` - Filtra per paese di destinazione
    - `includeInactive` - Includi anche tariffe inattive
- `GET /api/rates/:id` - Ottieni una tariffa specifica
- `POST /api/rates` - Crea una nuova tariffa
- `PUT /api/rates/:id` - Aggiorna una tariffa esistente
- `PATCH /api/rates/:id/margin-discount` - Aggiorna lo sconto sul margine di una tariffa
- `DELETE /api/rates/:id` - Elimina una tariffa

### Suggestions

- `GET /api/suggestions` - Ottieni tutti i suggerimenti attivi
- `GET /api/suggestions/:id` - Ottieni un suggerimento specifico
- `POST /api/suggestions` - Crea un nuovo suggerimento
- `PATCH /api/suggestions/:id/apply` - Marca un suggerimento come applicato
- `PATCH /api/suggestions/:id/dismiss` - Marca un suggerimento come respinto
- `DELETE /api/suggestions/:id` - Elimina un suggerimento

## Modelli di dati

### Carrier

```javascript
{
  name: String,
  logoUrl: String,
  isVolumetric: Boolean,
  fuelSurcharge: Number,
  services: [{
    name: String,
    code: String,
    description: String,
    deliveryTimeMin: Number,
    deliveryTimeMax: Number,
    destinationTypes: [String],
    pricing: [{
      destinationType: String,
      countryCode: String,
      // altri dettagli di prezzo
    }]
  }]
}
```

### Rate

```javascript
{
  carrierId: ObjectId,
  serviceCode: String,
  serviceName: String,
  basePrice: Number,
  fuelSurcharge: Number,
  volumeDiscount: Number,
  promotionDiscount: Number,
  purchasePrice: Number,
  sellingPrice: Number,
  marginDiscount: Number,
  weight: Number,
  destinationType: String,
  destinationCountry: String,
  deliveryTimeMin: Number,
  deliveryTimeMax: Number,
  active: Boolean
}
```

### Suggestion

```javascript
{
  type: String,
  carrierId: ObjectId,
  message: String,
  details: Object,
  priority: Number,
  applied: Boolean,
  dismissed: Boolean,
  createdAt: Date,
  validUntil: Date
}
``` 