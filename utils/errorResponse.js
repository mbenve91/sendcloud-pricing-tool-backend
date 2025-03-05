/**
 * Classe per la gestione personalizzata degli errori API
 * Estende la classe Error nativa di JavaScript
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse; 