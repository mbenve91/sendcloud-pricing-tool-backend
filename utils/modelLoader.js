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
  
  try {
    // Verifica il contenuto della directory models
    const modelsPath = path.join(process.cwd(), 'models');
    console.log('Contenuto della directory models:');
    const modelFiles = fs.readdirSync(modelsPath);
    console.log(modelFiles);
    
    // Versione case-insensitive per trovare il file corretto
    const modelNameLower = modelName.toLowerCase();
    const matchingFile = modelFiles.find(file => 
      path.basename(file, '.js').toLowerCase() === modelNameLower
    );
    
    if (matchingFile) {
      console.log(`File corrispondente trovato: ${matchingFile}`);
      
      // Carica il modello con il nome di file effettivo trovato
      try {
        const fullPath = path.join(modelsPath, path.basename(matchingFile, '.js'));
        const model = require(fullPath);
        console.log(`Modello ${modelName} caricato con successo da ${fullPath}`);
        return model;
      } catch (error) {
        console.error(`Errore durante il caricamento del modello da ${matchingFile}: ${error.message}`);
        throw error;
      }
    } else {
      console.error(`Nessun file corrispondente al modello ${modelName} trovato in ${modelsPath}`);
      throw new Error(`Modello ${modelName} non trovato`);
    }
  } catch (e) {
    console.error(`Errore durante la ricerca del modello ${modelName}: ${e.message}`);
    throw e;
  }
}

module.exports = {
  loadModel
}; 