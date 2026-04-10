/**
 * ===========================================
 * GESTIONNAIRE D'ERREURS GLOBAL
 * ===========================================
 * 
 * Ce middleware capture TOUTES les erreurs de l'application
 * et renvoie une réponse JSON cohérente.
 * 
 * Bonnes Pratiques :
 * - Différencier développement et production
 * - Ne pas exposer les détails techniques en production
 * - Logger toutes les erreurs
 * - Gérer les types d'erreurs spécifiques
 */

const ApiError = require('../utils/ApiError');

/**
 * Gestionnaire d'erreurs Express
 * IMPORTANT : Doit avoir exactement 4 paramètres (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // Copier l'erreur pour éviter de la muter
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Définir les valeurs par défaut
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // ===========================================
  // GESTION DES ERREURS SPÉCIFIQUES
  // ===========================================

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }

  // Erreur de cast Mongoose (ObjectId invalide)
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Erreur de clé dupliquée MongoDB
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Erreur JWT invalide
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Erreur de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = handleJSONSyntaxError(err);
  }

  // ===========================================
  // LOGGING
  // ===========================================

  // Logger l'erreur (en développement ou si erreur serveur)
  if (process.env.NODE_ENV === 'development' || error.statusCode >= 500) {
    console.error('═'.repeat(50));
    console.error(`❌ ERREUR [${error.statusCode}]`);
    console.error('═'.repeat(50));
    console.error('Message:', error.message);
    console.error('URL:', req.originalUrl);
    console.error('Méthode:', req.method);
    console.error('IP:', req.ip);
    console.error('Utilisateur-Agent:', req.get('Utilisateur-Agent'));
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
    console.error('═'.repeat(50));
  }

  // ===========================================
  // RÉPONSE
  // ===========================================

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// ===========================================
// RÉPONSES D'ERREUR
// ===========================================

/**
 * Réponse d'erreur en développement (détaillée)
 */
const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    code: err.code,
    errors: err.errors,
    error: err,
    stack: err.stack,
  });
};

/**
 * Réponse d'erreur en production (sécurisée)
 */
const sendErrorProd = (err, req, res) => {
  // Erreur opérationnelle : envoyer le message au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
      errors: err.errors,
    });
  } else {
    // Erreur de programmation : ne pas divulguer les détails
    res.status(500).json({
      status: 'error',
      message: 'Une erreur inattendue s\'est produite',
      code: 'INTERNAL_ERROR',
    });
  }
};

// ===========================================
// GESTIONNAIRES D'ERREURS SPÉCIFIQUES
// ===========================================

/**
 * Erreur de validation Mongoose
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
    value: el.value,
  }));

  const error = ApiError.validationError('Erreur de validation des données', errors);
  error.stack = err.stack;
  return error;
};

/**
 * Erreur de cast Mongoose (ID invalide)
 */
const handleCastError = (err) => {
  const message = `Valeur invalide pour ${err.path}: ${err.value}`;
  const error = ApiError.badRequest(message, 'INVALID_ID');
  error.stack = err.stack;
  return error;
};

/**
 * Erreur de clé dupliquée MongoDB
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Le champ '${field}' avec la valeur '${value}' existe déjà`;
  const error = ApiError.conflict(message, 'DUPLICATE_KEY');
  error.stack = err.stack;
  return error;
};

/**
 * Erreur JWT invalide
 */
const handleJWTError = () => {
  return ApiError.unauthorized('Token invalide. Veuillez vous reconnecter.', 'INVALID_TOKEN');
};

/**
 * Erreur JWT expiré
 */
const handleJWTExpiredError = () => {
  return ApiError.unauthorized('Votre session a expiré. Veuillez vous reconnecter.', 'TOKEN_EXPIRED');
};

/**
 * Erreur de syntaxe JSON dans le body
 */
const handleJSONSyntaxError = (err) => {
  return ApiError.badRequest('Corps de requête JSON invalide', 'INVALID_JSON');
};

// ===========================================
// EXPORT
// ===========================================

module.exports = errorHandler;
