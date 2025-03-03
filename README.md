# SendQuote - Strumento di Confronto Tariffe per SendCloud

SendQuote è un'applicazione full-stack che aiuta i venditori di SendCloud a confrontare e presentare le tariffe di spedizione di diversi corrieri ai potenziali clienti. L'applicazione semplifica il processo di determinazione delle tariffe appropriate e degli sconti, fornendo anche suggerimenti basati sull'intelligenza artificiale.

## Funzionalità Principali

- Confronto delle tariffe di spedizione di diversi corrieri
- Filtri per corriere, tipo di servizio, peso, destinazione e volume
- Visualizzazione di sconti e margini di profitto con indicatori visivi
- Suggerimenti AI per l'ottimizzazione delle tariffe
- Interfaccia utente intuitiva e reattiva

## Tecnologie Utilizzate

### Backend
- Node.js/Express
- MongoDB
- RESTful API

### Frontend
- React
- Material-UI
- Axios

## Struttura del Progetto

```
sendcloud-tool/
├── models/
│   └── carrier.js
├── routes/
│   └── carrier.routes.js
├── scripts/
│   └── seedDatabase.js
├── public/
│   └── images/
│       └── carriers/
├── client/
│   └── src/
│       └── components/
│           └── RateComparisonCard.jsx
├── app.js
├── .env
└── package.json
```

## Installazione e Avvio

### Prerequisiti
- Node.js (v14 o superiore)
- MongoDB

### Installazione

1. Clona il repository:
```
git clone https://github.com/tuousername/sendcloud-tool.git
cd sendcloud-tool
```

2. Installa le dipendenze del backend:
```
npm install
```

3. Installa le dipendenze del frontend:
```
cd client
npm install
cd ..
```

4. Configura le variabili d'ambiente:
Crea un file `.env` nella directory principale con il seguente contenuto:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sendcloud-tool
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

5. Popola il database con dati di esempio:
```
npm run seed
```

### Avvio dell'applicazione

1. Avvia il server backend:
```
npm run dev
```

2. In un altro terminale, avvia il client React:
```
cd client
npm start
```

3. Apri il browser e vai a `http://localhost:3000`

## API Endpoints

- `GET /api/carriers` - Elenco di tutti i corrieri
- `GET /api/carriers/:id` - Dettagli di un corriere specifico
- `GET /api/compare-rates` - Confronto delle tariffe con opzioni di filtro
- `GET /api/ai-suggestions` - Suggerimenti AI per ottimizzare le tariffe

## Licenza

ISC 