/**
 * ===========================================
 * MIDDLEWARE DE VALIDATION
 * ===========================================
 * 
 * Utilise express-validator pour valider et assainir
 * les données entrantes.
 * 
 * Bonnes Pratiques :
 * - Valider TOUTES les entrées utilisateur
 * - Assainir pour prévenir XSS et injections
 * - Messages d'erreur clairs et en français
 * - Validation réutilisable
 */

const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// ===========================================
// MIDDLEWARE DE VÉRIFICATION DES ERREURS
// ===========================================

/**
 * Vérifie les résultats de validation et renvoie les erreurs
 * À utiliser après les règles de validation
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));

    throw ApiError.validationError('Erreur de validation', formattedErrors);
  }
  
  next();
};

// ===========================================
// RÈGLES DE VALIDATION UTILISATEUR
// ===========================================

/**
 * Validation pour la création d'utilisateur
 * POST /api/v1/users
 */
const createUserValidation = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .escape(), // Prévient XSS

  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body('motDePasse')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  body('motDePasseConfirm')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.motDePasse) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),

  body('role')
    .optional()
    .isIn(['etudiant', 'enseignant', 'admin'])
    .withMessage('Le rôle doit être : etudiant, enseignant ou admin'),

  body('etat')
    .optional()
    .isIn(['pending', 'active', 'suspended', 'blocked'])
    .withMessage('L\'etat doit être : pending, active, suspended ou blocked'),

  validate,
];

/**
 * Validation pour la mise à jour d'utilisateur
 * PUT /api/v1/users/:id
 */
const updateUserValidation = [
  body('nom')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .escape(),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['etudiant', 'enseignant', 'admin'])
    .withMessage('Le rôle doit être : etudiant, enseignant ou admin'),

  body('etat')
    .optional()
    .isIn(['pending', 'active', 'suspended', 'blocked'])
    .withMessage('L\'etat doit être : pending, active, suspended ou blocked'),

  // Interdire la modification du mot de passe via cette route
  body('motDePasse')
    .isEmpty()
    .withMessage('Utilisez la route /change-password pour modifier le mot de passe'),

  validate,
];

/**
 * Validation de l'ID MongoDB dans les paramètres
 */
const validateMongoId = [
  param('id')
    .notEmpty()
    .withMessage('L\'ID est requis')
    .isMongoId()
    .withMessage('Format d\'ID invalide'),

  validate,
];

// ===========================================
// RÈGLES DE VALIDATION REQUÊTE (QUERY)
// ===========================================

/**
 * Validation des paramètres de pagination et filtrage
 * GET /api/v1/users?page=1&limit=10&sort=-createdAt
 */
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
    .toInt(),

  query('sort')
    .optional()
    .matches(/^-?[a-zA-Z_]+$/)
    .withMessage('Format de tri invalide'),

  query('fields')
    .optional()
    .matches(/^[a-zA-Z_,]+$/)
    .withMessage('Format des champs invalide'),

  query('role')
    .optional()
    .isIn(['etudiant', 'enseignant', 'admin'])
    .withMessage('Rôle invalide'),

  validate,
];

// ===========================================
// VALIDATIONS GÉNÉRIQUES RÉUTILISABLES
// ===========================================

/**
 * Valide qu'un champ est un email
 */
const isValidEmail = (field) => [
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} est requis`)
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),
  validate,
];

/**
 * Valide qu'un champ est une chaîne non vide
 */
const isRequiredString = (field, minLength = 1, maxLength = 255) => [
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} est requis`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} doit contenir entre ${minLength} et ${maxLength} caractères`)
    .escape(),
  validate,
];

// ===========================================
// EXPORTS
// ===========================================

module.exports = {
  validate,
  createUserValidation,
  updateUserValidation,
  validateMongoId,
  validateQueryParams,
  isValidEmail,
  isRequiredString,
};
