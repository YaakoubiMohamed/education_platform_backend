/**
 * ===========================================
 * CONTRÔLEUR AUTHENTIFICATION
 * ===========================================
 * 
 * Gère l'authentification des utilisateurs :
 * - Inscription (register)
 * - Connexion (login)
 * - Déconnexion (logout)
 * - Rafraîchissement des tokens (refreshToken)
 * - Récupération du profil (getCurrentUser)
 * 
 * Bonnes Pratiques :
 * - JWT tokens avec expiration
 * - Refresh tokens pour la sécurité
 * - Gestion des tentatives de connexion échouées
 * - Verrouillage du compte après N tentatives
 */

const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateur');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// ===========================================
// CONSTANTES
// ===========================================

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
const TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY = '30d';

// ===========================================
// UTILITAIRES
// ===========================================

/**
 * Génère un JWT token
 * @param {string} userId - ID de l'utilisateur
 * @param {string} expiresIn - Durée d'expiration (ex: '7d', '1h')
 * @returns {string} Token JWT
 */
const generateToken = (userId, expiresIn = TOKEN_EXPIRY) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn }
  );
};

/**
 * Génère tokens d'accès et de rafraîchissement
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} Objet avec accessToken et refreshToken
 */
const generateTokens = (userId) => {
  const accessToken = generateToken(userId, TOKEN_EXPIRY);
  const refreshToken = generateToken(userId, REFRESH_TOKEN_EXPIRY);

  return { accessToken, refreshToken };
};

/**
 * Envoie les tokens dans les cookies et la réponse
 * @param {Object} res - Objet réponse Express
 * @param {string} accessToken - Token d'accès
 * @param {string} refreshToken - Token de rafraîchissement
 */
const sendTokensResponse = (res, accessToken, refreshToken) => {
  // Options des cookies HTTP-only (sécurité)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
  };

  // Définir les cookies
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return { accessToken, refreshToken };
};

// ===========================================
// AUTH OPERATIONS
// ===========================================

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { nom, email, motDePasse, role } = req.body;

  // Validation des champs requis
  if (!nom || !email || !motDePasse) {
    throw ApiError.badRequest('Le nom, l\'email et le mot de passe sont requis');
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await Utilisateur.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Cet email est déjà utilisé');
  }

  // Valider la force du mot de passe
  if (motDePasse.length < 8) {
    throw ApiError.badRequest('Le mot de passe doit contenir au moins 8 caractères');
  }

  // Créer le nouvel utilisateur
  const newUser = await Utilisateur.create({
    nom,
    email,
    motDePasse,
    role: role || 'etudiant',
    etat: 'active', // Activation automatique (email confirmation supprimée)
    emailVerifie: true, // Marquer comme vérifié
  });

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(newUser._id);

  // Envoyer les tokens dans les cookies
  sendTokensResponse(res, accessToken, refreshToken);

  // Réponse
  res.status(201).json({
    status: 'success',
    message: 'Utilisateur créé avec succès',
    data: {
      user: newUser.toPublicJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, motDePasse } = req.body;

  // Validation
  if (!email || !motDePasse) {
    throw ApiError.badRequest('L\'email et le mot de passe sont requis');
  }

  // Récupérer l'utilisateur (inclure le mot de passe avec select: false)
  const user = await Utilisateur.findOne({ email }).select('+motDePasse');

  if (!user) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect');
  }

  // Vérifier si le compte est verrouillé
  if (user.compteVerrouilleJusqu && new Date() < user.compteVerrouilleJusqu) {
    const timeRemaining = Math.ceil(
      (user.compteVerrouilleJusqu - new Date()) / 1000 / 60
    );
    throw ApiError.forbidden(
      `Compte verrouillé. Réessayez dans ${timeRemaining} minutes`
    );
  }

  // Vérifier si le compte est suspendu ou bloqué
  if (user.etat === 'suspended' || user.etat === 'blocked') {
    throw ApiError.forbidden(
      `Compte ${user.etat === 'suspended' ? 'suspendu' : 'bloqué'}. Contactez l'administrateur`
    );
  }

  // Comparer le mot de passe
  const isPasswordValid = await user.comparePassword(motDePasse);

  if (!isPasswordValid) {
    // Incrémenter les tentatives échouées
    user.tentativesConnexionEchouees += 1;

    // Verrouiller le compte après MAX_LOGIN_ATTEMPTS tentatives
    if (user.tentativesConnexionEchouees >= MAX_LOGIN_ATTEMPTS) {
      user.compteVerrouilleJusqu = new Date(Date.now() + LOCK_TIME);
      await user.save();
      throw ApiError.forbidden(
        'Trop de tentatives échouées. Compte verrouillé pour 30 minutes'
      );
    }

    await user.save();
    throw ApiError.unauthorized('Email ou mot de passe incorrect');
  }

  // Réinitialiser les tentatives échouées et mettre à jour la dernière connexion
  if (user.tentativesConnexionEchouees > 0) {
    user.tentativesConnexionEchouees = 0;
    user.compteVerrouilleJusqu = null;
  }
  user.derniereConnexion = new Date();
  await user.save();

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Envoyer les tokens dans les cookies
  sendTokensResponse(res, accessToken, refreshToken);

  // Réponse
  res.status(200).json({
    status: 'success',
    message: 'Connexion réussie',
    data: {
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Déconnexion d'un utilisateur
 * @route   POST /api/v1/auth/logout
 * @access  Protected
 */
exports.logout = asyncHandler(async (req, res) => {
  // Effacer les cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    status: 'success',
    message: 'Déconnexion réussie',
  });
});

/**
 * @desc    Rafraîchir le token d'accès
 * @route   POST /api/v1/auth/refresh
 * @access  Public (avec refreshToken)
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    throw ApiError.badRequest('Le refresh token est requis');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
  } catch (error) {
    throw ApiError.unauthorized('Refresh token invalide ou expiré');
  }

  // Vérifier que l'utilisateur existe toujours
  const user = await Utilisateur.findById(decoded.id);
  if (!user) {
    throw ApiError.notFound('Utilisateur non trouvé');
  }

  // Générer un nouveau token d'accès
  const newAccessToken = generateToken(user._id, TOKEN_EXPIRY);

  // Envoyer dans cookie aussi
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
  res.cookie('accessToken', newAccessToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Token rafraîchi avec succès',
    data: {
      accessToken: newAccessToken,
    },
  });
});

/**
 * @desc    Obtenir le profil de l'utilisateur actuel
 * @route   GET /api/v1/auth/me
 * @access  Protected
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await Utilisateur.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('Utilisateur non trouvé');
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: user.toPublicJSON(),
    },
  });
});

/**
 * @desc    Modifier le mot de passe
 * @route   POST /api/v1/auth/change-password
 * @access  Protected
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { motDePasseActuel, nouveauMotDePasse, confirmMotDePasse } = req.body;

  // Validation
  if (!motDePasseActuel || !nouveauMotDePasse || !confirmMotDePasse) {
    throw ApiError.badRequest('Tous les champs sont requis');
  }

  if (nouveauMotDePasse !== confirmMotDePasse) {
    throw ApiError.badRequest('Les mots de passe ne correspondent pas');
  }

  if (nouveauMotDePasse.length < 8) {
    throw ApiError.badRequest(
      'Le nouveau mot de passe doit contenir au moins 8 caractères'
    );
  }

  // Récupérer l'utilisateur avec le mot de passe
  const user = await Utilisateur.findById(req.user.id).select('+motDePasse');

  // Vérifier le mot de passe actuel
  const isPasswordValid = await user.comparePassword(motDePasseActuel);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Le mot de passe actuel est incorrect');
  }

  // Mettre à jour le mot de passe
  user.motDePasse = nouveauMotDePasse;
  user.motDePasseModifieLe = new Date();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Mot de passe modifié avec succès',
  });
});
