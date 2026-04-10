/**
 * ===========================================
 * CLASSE D'ERREUR API PERSONNALISÉE
 * ===========================================
 * 
 * Étend la classe Error native pour fournir :
 * - Codes de statut HTTP
 * - Distinction erreurs opérationnelles vs programmation
 * - Méthodes factory pour erreurs courantes
 * 
 * Bonne Pratique : Utiliser des erreurs personnalisées
 * pour une gestion cohérente dans toute l'application
 */

class ApiError extends Error {
  /**
   * Crée une nouvelle erreur API
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP (400, 404, 500, etc.)
   * @param {string} [code] - Code d'erreur interne (optionnel)
   * @param {Array} [errors] - Détails des erreurs (validation, etc.)
   */
  constructor(message, statusCode, code = null, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.errors = errors;
    
    // Distingue les erreurs opérationnelles (prévisibles)
    // des erreurs de programmation (bugs)
    this.isOperational = true;

    // Capture la stack trace sans inclure le constructeur
    Error.captureStackTrace(this, this.constructor);
  }

  // ===========================================
  // MÉTHODES FACTORY - ERREURS CLIENT (4xx)
  // ===========================================

  /**
   * 400 Bad Request - Requête malformée
   */
  static badRequest(message = 'Requête invalide', code = 'BAD_REQUEST') {
    return new ApiError(message, 400, code);
  }

  /**
   * 401 Unauthorized - Non authentifié
   */
  static unauthorized(message = 'Non authentifié', code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }

  /**
   * 403 Forbidden - Non autorisé (authentifié mais pas les droits)
   */
  static forbidden(message = 'Accès refusé', code = 'FORBIDDEN') {
    return new ApiError(message, 403, code);
  }

  /**
   * 404 Not Found - Ressource non trouvée
   */
  static notFound(message = 'Ressource non trouvée', code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  /**
   * 405 Method Not Allowed - Méthode non supportée
   */
  static methodNotAllowed(message = 'Méthode non autorisée', code = 'METHOD_NOT_ALLOWED') {
    return new ApiError(message, 405, code);
  }

  /**
   * 409 Conflict - Conflit (doublon, état incohérent)
   */
  static conflict(message = 'Conflit de ressources', code = 'CONFLICT') {
    return new ApiError(message, 409, code);
  }

  /**
   * 415 Unsupported Media Type - Type de contenu non supporté
   */
  static unsupportedMediaType(message = 'Type de contenu non supporté', code = 'UNSUPPORTED_MEDIA_TYPE') {
    return new ApiError(message, 415, code);
  }

  /**
   * 422 Unprocessable Entity - Erreur de validation
   */
  static validationError(message = 'Erreur de validation', errors = [], code = 'VALIDATION_ERROR') {
    return new ApiError(message, 422, code, errors);
  }

  /**
   * 429 Too Many Requests - Limite de débit atteinte
   */
  static tooManyRequests(message = 'Trop de requêtes', code = 'TOO_MANY_REQUESTS') {
    return new ApiError(message, 429, code);
  }

  // ===========================================
  // MÉTHODES FACTORY - ERREURS SERVEUR (5xx)
  // ===========================================

  /**
   * 500 Internal Server Error - Erreur serveur générique
   */
  static internal(message = 'Erreur interne du serveur', code = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, code);
  }

  /**
   * 501 Not Implemented - Fonctionnalité non implémentée
   */
  static notImplemented(message = 'Fonctionnalité non implémentée', code = 'NOT_IMPLEMENTED') {
    return new ApiError(message, 501, code);
  }

  /**
   * 503 Service Unavailable - Service temporairement indisponible
   */
  static serviceUnavailable(message = 'Service temporairement indisponible', code = 'SERVICE_UNAVAILABLE') {
    return new ApiError(message, 503, code);
  }

  // ===========================================
  // MÉTHODES UTILITAIRES
  // ===========================================

  /**
   * Convertit l'erreur en objet JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      errors: this.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }

  /**
   * Vérifie si une erreur est une ApiError
   * @param {Error} error 
   * @returns {boolean}
   */
  static isApiError(error) {
    return error instanceof ApiError;
  }

  /**
   * Crée une ApiError à partir d'une erreur Mongoose
   * @param {Error} error - Erreur Mongoose
   * @returns {ApiError}
   */
  static fromMongooseError(error) {
    // Erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
      return ApiError.validationError('Erreur de validation', errors);
    }

    // Erreur de cast (ID invalide)
    if (error.name === 'CastError') {
      return ApiError.badRequest(`${error.path} invalide: ${error.value}`, 'INVALID_ID');
    }

    // Erreur de clé dupliquée
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return ApiError.conflict(`${field} '${value}' existe déjà`, 'DUPLICATE_KEY');
    }

    // Erreur générique
    return ApiError.internal(error.message);
  }
}

// ===========================================
// EXPORT
// ===========================================

module.exports = ApiError;
