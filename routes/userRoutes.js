/**
 * ===========================================
 * ROUTES UTILISATEUR
 * ===========================================
 * 
 * Définit les endpoints CRUD pour les utilisateurs
 * 
 * Bonnes Pratiques :
 * - Chaînage des routes pour le même chemin
 * - Validation avant le contrôleur
 * - Nommage RESTful cohérent
 * - Documentation des endpoints
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const {
  createUserValidation,
  updateUserValidation,
  validateMongoId,
  validateQueryParams,
} = require('../middleware/validate');

// ===========================================
// ROUTES SPÉCIALES (avant les routes avec :id)
// ===========================================

/**
 * @route   GET /api/v1/users/stats
 * @desc    Obtenir les statistiques des utilisateurs
 * @access  Public
 */
router.get('/stats', userController.getUserStats);

/**
 * @route   GET /api/v1/users/search
 * @desc    Rechercher des utilisateurs
 * @access  Public
 * @query   q - Terme de recherche
 */
router.get('/search', validateQueryParams, userController.searchUsers);

// ===========================================
// ROUTES CRUD PRINCIPALES
// ===========================================

/**
 * Routes pour /api/v1/users
 */
router
  .route('/')
  /**
   * @route   GET /api/v1/users
   * @desc    Obtenir tous les utilisateurs (avec pagination)
   * @access  Public
   * @query   page, limit, sort, fields, role
   */
  .get(validateQueryParams, userController.getAllUsers)
  
  /**
   * @route   POST /api/v1/users
   * @desc    Créer un nouvel utilisateur
   * @access  Public
   * @body    name, email, password, passwordConfirm, role?
   */
  .post(createUserValidation, userController.createUser);

/**
 * Routes pour /api/v1/users/:id
 */
router
  .route('/:id')
  /**
   * @route   GET /api/v1/users/:id
   * @desc    Obtenir un utilisateur par son ID
   * @access  Public
   */
  .get(validateMongoId, userController.getUserById)
  
  /**
   * @route   PUT /api/v1/users/:id
   * @desc    Mettre à jour un utilisateur (remplacement complet)
   * @access  Public
   * @body    name, email, role
   */
  .put(validateMongoId, updateUserValidation, userController.updateUser)
  
  /**
   * @route   PATCH /api/v1/users/:id
   * @desc    Mettre à jour partiellement un utilisateur
   * @access  Public
   * @body    name?, email?, role?
   */
  .patch(validateMongoId, updateUserValidation, userController.partialUpdateUser)
  
  /**
   * @route   DELETE /api/v1/users/:id
   * @desc    Supprimer un utilisateur (soft delete)
   * @access  Public
   */
  .delete(validateMongoId, userController.deleteUser);

// ===========================================
// ROUTES SUPPLÉMENTAIRES
// ===========================================

/**
 * @route   GET /api/v1/users/:id/profile
 * @desc    Obtenir le profil complet d'un utilisateur
 * @access  Public
 */
router.get('/:id/profile', validateMongoId, userController.getUserProfile);

/**
 * @route   PATCH /api/v1/users/:id/restore
 * @desc    Restaurer un utilisateur supprimé
 * @access  Admin
 */
router.patch('/:id/restore', validateMongoId, userController.restoreUser);

/**
 * @route   DELETE /api/v1/users/:id/permanent
 * @desc    Supprimer définitivement un utilisateur
 * @access  Admin
 */
router.delete('/:id/permanent', validateMongoId, userController.permanentDeleteUser);

// ===========================================
// EXPORT
// ===========================================

module.exports = router;
