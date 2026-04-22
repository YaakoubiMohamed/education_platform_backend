const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const Utilisateur = require('../models/utilisateur');

/**
 * ===========================================
 * MIDDLEWARES D'AUTHENTIFICATION ET D'AUTORISATION
 * ===========================================
 * 
 * Gère :
 * - Vérification des JWT tokens
 * - Autorisation par rôle
 * - Fallback dev avec headers pour les tests
 */

/**
 * Middleware de développement pour les tests (optionnel)
 *
 * Attendu : un header `x-user-role` (e.g. admin, enseignant, etudiant)
 * et un header `x-user-id` pour l'ID de l'utilisateur.
 *
 * Utilisé UNIQUEMENT en développement pour les tests sans authentification JWT
 */
exports.fakeAuthOptional = (req, res, next) => {
  // Ne pas remplacer si un JWT valide est présent
  if (req.header('authorization') || (req.cookies && req.cookies.accessToken)) {
    return next();
  }

  const role = req.header('x-user-role');
  const id = req.header('x-user-id');

  if (!role || !id) {
    return next();
  }

  req.user = {
    id,
    role,
  };

  next();
};

/**
 * Middleware de protection - Vérifie le JWT token
 * 
 * Le token peut venir de :
 * 1. Cookie 'accessToken'
 * 2. Header 'Authorization: Bearer <token>'
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Vérifier le cookie
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // 2. Vérifier le header Authorization
  if (req.header('authorization')) {
    const authHeader = req.header('authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    throw ApiError.unauthorized(
      'Vous devez être connecté pour accéder à cette ressource'
    );
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Récupérer l'utilisateur depuis la base de données
    const user = await Utilisateur.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('Utilisateur non trouvé');
    }

    // Vérifier que le compte est actif
    if (user.etat !== 'active') {
      throw ApiError.forbidden(
        `Accès refusé : compte ${user.etat}`
      );
    }

    // Attacher l'utilisateur à la requête
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      etat: user.etat,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized(
        'Votre session a expiré. Veuillez vous reconnecter'
      );
    }

    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Token invalide');
    }

    // Re-throw l'erreur ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.unauthorized('Erreur lors de la vérification du token');
  }
};

/**
 * Middleware d'autorisation - Vérifie que l'utilisateur a les rôles autorisés
 * 
 * @param  {...string} roles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Vous devez être connecté');
  }

  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(
      'Accès refusé : vous n\'avez pas les permissions nécessaires'
    );
  }

  next();
};
