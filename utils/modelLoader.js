/**
 * Utility per caricare i modelli Mongoose in modo consistente in tutti gli ambienti
 * Gestisce sia l'ambiente di sviluppo locale che quello di produzione su Render
 */

const path = require('path');

/**
 * Carica un modello Mongoose gestendo i diversi percorsi possibili in vari ambienti
 * @param {string} modelName - Nome del modello (es. 'Carrier', 'Service', 'Rate')
 * @returns Il modello Mongoose caricato
 */
function loadModel(modelName) {
  const possiblePaths = [
    // Percorso relativo dal controller (ambiente locale)
    `../models/${modelName}`,
    // Percorso assoluto dal root del progetto (alternativa locale)
    path.join(process.cwd(), 'models', modelName),
    // Percorso di render
    path.join('/opt/render/project/src', 'models', modelName),
    // Percorso di render con Backend
    path.join('/opt/render/project/src/Backend', 'models', modelName)
  ];

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