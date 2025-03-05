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
  
  // Crea varianti del nome del modello per gestire la case sensitivity
  const modelVariants = [
    modelName,                  // Originale (es. "Carrier")
    modelName.toLowerCase(),    // Tutto minuscolo (es. "carrier")
    modelName.toUpperCase(),    // Tutto maiuscolo (es. "CARRIER")
    modelName.charAt(0).toUpperCase() + modelName.slice(1).toLowerCase() // Prima lettera maiuscola (es. "Carrier")
  ];
  
  // Remove duplicates from variants
  const uniqueModelVariants = [...new Set(modelVariants)];
  console.log(`Varianti del nome del modello da provare: ${uniqueModelVariants.join(', ')}`);
  
  // Lista dei possibili percorsi base
  const basePaths = [
    '../models',                      // Percorso relativo 
    path.join(process.cwd(), 'models'), // Percorso assoluto
    path.join(process.cwd(), '../models') // Fallback
  ];
  
  // Crea un array di tutte le combinazioni possibili di percorsi e nomi di modello
  const possiblePaths = [];
  for (const basePath of basePaths) {
    for (const variant of uniqueModelVariants) {
      possiblePaths.push(path.join(basePath, variant));
    }
  }
  
  // Debug - mostra i file nella directory corrente
  try {
    console.log('Contenuto della directory corrente:');
    console.log(fs.readdirSync(process.cwd()));
    
    // Prova a leggere la directory models
    try {
      const modelsPath = path.join(process.cwd(), 'models');
      console.log('Contenuto della directory models:');
      const modelFiles = fs.readdirSync(modelsPath);
      console.log(modelFiles);
      
      // Verifica se esistono file che corrispondono alle varianti del nome del modello
      // indipendentemente dall'estensione (.js)
      const matchingFiles = modelFiles.filter(file => {
        const baseName = path.basename(file, '.js').toLowerCase();
        return uniqueModelVariants.some(v => v.toLowerCase() === baseName);
      });
      
      if (matchingFiles.length > 0) {
        console.log(`File corrispondenti trovati: ${matchingFiles.join(', ')}`);
      }
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
  
  // Se ancora non abbiamo trovato il modello, proviamo a cercarlo direttamente nei file
  // della directory models
  if (!loadedModel) {
    try {
      const modelsPath = path.join(process.cwd(), 'models');
      const modelFiles = fs.readdirSync(modelsPath);
      
      // Cerca un file che potrebbe corrispondere a qualsiasi variante del nome del modello
      for (const file of modelFiles) {
        const baseName = path.basename(file, '.js').toLowerCase();
        if (uniqueModelVariants.some(v => v.toLowerCase() === baseName)) {
          try {
            loadedModel = require(path.join(modelsPath, path.basename(file, '.js')));
            console.log(`Modello ${modelName} caricato con successo usando il metodo di ricerca diretta: ${path.join(modelsPath, path.basename(file, '.js'))}`);
            break;
          } catch (error) {
            console.log(`Errore durante il caricamento diretto del file trovato ${file}: ${error.message}`);
          }
        }
      }
    } catch (e) {
      console.log('Errore durante la ricerca diretta nei file:', e.message);
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