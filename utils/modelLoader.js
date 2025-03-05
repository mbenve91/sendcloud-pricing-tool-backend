/**
 * Utility per caricare i modelli Mongoose in modo consistente in tutti gli ambienti
 */

const path = require('path');
const fs = require('fs');

/**
 * Carica un modello Mongoose gestendo i diversi percorsi possibili in vari ambienti
 * @param {string} modelName - Nome del modello (es. 'Carrier', 'Service', 'Rate')
 * @returns Il modello Mongoose caricato
 */
function loadModel(modelName) {
  // Log informazioni ambientali per debugging
  console.log(`Directory corrente: ${process.cwd()}`);
  
  // Lista ordinata di percorsi da provare
  const possiblePaths = [
    // Percorso relativo (funziona sia in locale che in produzione se la root è impostata correttamente)
    `../models/${modelName}`,
    // Percorso assoluto dalla directory corrente
    path.join(process.cwd(), 'models', modelName),
    // Fallback con percorso completo (solo per sicurezza)
    path.join(process.cwd(), '../models', modelName)
  ];

  // Debug - mostra i file nella directory corrente
  try {
    console.log('Contenuto della directory corrente:');
    console.log(fs.readdirSync(process.cwd()));
    
    // Prova a leggere la directory models
    try {
      const modelsPath = path.join(process.cwd(), 'models');
      console.log('Contenuto della directory models:');
      console.log(fs.readdirSync(modelsPath));
    } catch (e) {
      console.log('Non è stato possibile leggere la directory models:', e.message);
    }
  } catch (e) {
    console.log('Errore durante la lettura delle directory:', e.message);
  }

  let loadedModel = null;
  let lastError = null;

  // Prova tutti i percorsi possibili
  for (const modelPath of possiblePaths) {
    try {
      loadedModel = require(modelPath);
      console.log(`Modello ${modelName} caricato con successo da ${modelPath}`);
      break;
    } catch (error) {
      lastError = error;
      console.log(`Tentativo fallito di caricare ${modelName} da ${modelPath}: ${error.message}`);
    }
  }

  if (!loadedModel) {
    console.error(`Impossibile caricare il modello ${modelName} da nessun percorso conosciuto`);
    throw lastError;
  }

  return loadedModel;
}

module.exports = {
  loadModel
}; 