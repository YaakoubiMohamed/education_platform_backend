const express = require('express');
const router = express.Router();

const formationController = require('../controllers/formationController');
const { protect, restrictTo } = require('../middleware/auth');

/**
 * Routes Formation
 * 
 * IMPORTANT: L'ordre des routes est crucial!
 * Les routes spécifiques doivent être définies AVANT les routes avec paramètres
 * pour éviter que "/featured" soit interprété comme un ":id"
 */

// ============================================
// ROUTES SPÉCIALES (sans paramètre dynamique)
// ============================================

// GET /api/formations/search
// Recherche textuelle de formations
router.get('/search', formationController.searchFormations);

// GET /api/formations/featured
// Récupère les formations mises en avant
router.get('/featured', formationController.getFeaturedFormations);

// GET /api/formations/slug/:slug
// Récupère une formation par son slug (URL-friendly)
router.get('/slug/:slug', formationController.getFormationBySlug);

// GET /api/formations/top-rated
// Récupère les formations les mieux notées
router.get('/top-rated', formationController.getTopRatedFormations);

// ============================================
// ROUTES AVEC PARAMÈTRES SPÉCIFIQUES
// ============================================

// GET /api/formations/categorie/:categorieId
// Récupère les formations d'une catégorie
router.get('/categorie/:categorieId', formationController.getFormationsByCategorie);

// GET /api/formations/enseignant/:enseignantId
// Récupère les formations d'un enseignant
router.get('/enseignant/:enseignantId', formationController.getFormationsByEnseignant);

// GET /api/formations/difficulty/:difficulty
// Récupère les formations par niveau de difficulté
router.get('/difficulty/:difficulty', formationController.getFormationsByDifficulty);

// ============================================
// ROUTES CRUD STANDARD
// ============================================

// GET /api/formations
// Liste toutes les formations avec pagination et filtres
router.get('/', formationController.getAllFormations);

// GET /api/formations/:id
// Récupère une formation spécifique par son ID MongoDB
router.get('/:id', formationController.getFormationById);

// POST /api/formations
// Crée une nouvelle formation
router.post('/', protect, formationController.createFormation);

// PUT /api/formations/:id
// Met à jour une formation existante
router.put('/:id', protect, formationController.updateFormation);

// DELETE /api/formations/:id
// Supprime une formation (Admin uniquement)
router.delete('/:id', protect, restrictTo('admin'), formationController.deleteFormation);

module.exports = router;
