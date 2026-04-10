const express = require('express');
const router = express.Router();

const categorieController = require('../controllers/categorieController');

/**
 * Routes Catégorie
 * 
 * IMPORTANT: L'ordre des routes est crucial!
 * Les routes spécifiques doivent être définies AVANT les routes avec paramètres
 * pour éviter que "/tree" soit interprété comme un ":id"
 */

// ============================================
// ROUTES SPÉCIALES (sans paramètre dynamique)
// ============================================

// GET /api/categories/tree
// Récupère l'arborescence complète des catégories
router.get('/tree', categorieController.getCategoriesTree);

// GET /api/categories/featured
// Récupère les catégories mises en avant
router.get('/featured', categorieController.getFeaturedCategories);

// GET /api/categories/slug/:slug
// Récupère une catégorie par son slug (URL-friendly)
router.get('/slug/:slug', categorieController.getCategorieBySlug);

// ============================================
// ROUTES CRUD STANDARD
// ============================================

// GET /api/categories
// Liste toutes les catégories avec pagination et filtres
router.get('/', categorieController.getAllCategories);

// GET /api/categories/:id/children
// Récupère les sous-catégories directes d'une catégorie
router.get('/:id/children', categorieController.getSubCategories);

// GET /api/categories/:id
// Récupère une catégorie spécifique par son ID MongoDB
router.get('/:id', categorieController.getCategorieById);

// POST /api/categories
// Crée une nouvelle catégorie
router.post('/', categorieController.createCategorie);

// PUT /api/categories/:id
// Met à jour une catégorie existante
router.put('/:id', categorieController.updateCategorie);

// DELETE /api/categories/:id
// Supprime une catégorie (avec vérifications)
router.delete('/:id', categorieController.deleteCategorie);

module.exports = router;