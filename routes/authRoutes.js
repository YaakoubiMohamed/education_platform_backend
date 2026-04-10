/**
 * ===========================================
 * ROUTES AUTHENTIFICATION
 * ===========================================
 * 
 * Endpoints publics pour :
 * - Inscription
 * - Connexion
 * - Déconnexion
 * - Rafraîchissement de token
 * - Récupération du profil
 * - Modification du mot de passe
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect, restrictTo, fakeAuthOptional } = require('../middleware/auth');

// ===========================================
// MIDDLEWARES
// ===========================================

// Middleware optionnel pour dev/test (fallback headers x-user-id, x-user-role)
router.use(fakeAuthOptional);

// ===========================================
// ROUTES PUBLIQUES
// ===========================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Inscription d'un nouveau utilisateur
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rafraîchir le token d'accès
 * @access  Public (avec refreshToken)
 */
router.post('/refresh', authController.refreshToken);

// ===========================================
// ROUTES PROTÉGÉES
// ===========================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir le profil de l'utilisateur actuel
 * @access  Protected
 */
router.get('/me', protect, authController.getCurrentUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Protected
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Modifier le mot de passe
 * @access  Protected
 */
router.post('/change-password', protect, authController.changePassword);

// ===========================================
// EXPORT
// ===========================================

module.exports = router;
