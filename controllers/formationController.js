const Formation = require('../models/formation');
const Categorie = require('../models/categorie');
const Utilisateur = require('../models/utilisateur');

/**
 * Récupérer toutes les formations avec pagination et filtres
 * GET /api/formations
 */
exports.getAllFormations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filtres booléens
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.isPublished !== undefined) {
      filter.isPublished = req.query.isPublished === 'true';
    }

    if (req.query.isFeatured !== undefined) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }

    // Filtres par références
    if (req.query.categorie) {
      filter.categorie = req.query.categorie;
    }

    if (req.query.enseignant) {
      filter.enseignant = req.query.enseignant;
    }

    // Filtre par niveau de difficulté
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    // Filtre par langue
    if (req.query.language) {
      filter.language = req.query.language;
    }

    // Filtre par tags
    if (req.query.tags) {
      const tagArray = req.query.tags.split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Filtre par prix
    if (req.query.minPrice || req.query.maxPrice) {
      filter.prix = {};
      if (req.query.minPrice) {
        filter.prix.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.prix.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filtre par note minimale
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Recherche textuelle
    if (req.query.search) {
      filter.$or = [
        { titre: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { shortDescription: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Tri
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [formations, total] = await Promise.all([
      Formation.find(filter)
        .populate('categorie', 'nom slug')
        .populate('enseignant', 'nom email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Formation.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Formations récupérées avec succès',
      data: {
        formations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

/**
 * Récupérer une formation par son ID
 * GET /api/formations/:id
 */
exports.getFormationById = async (req, res) => {
  try {
    const { id } = req.params;

    const formation = await Formation.findById(id)
      .populate('categorie', 'nom slug description')
      .populate('enseignant', 'nom email photo');

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Formation récupérée avec succès',
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la formation',
      error: error.message
    });
  }
};

/**
 * Créer une nouvelle formation
 * POST /api/formations
 */
exports.createFormation = async (req, res) => {
  try {
    const {
      titre, description, shortDescription, image,
      prix, originalPrice, categorie, enseignant,
      slug, difficulty, language, prerequisites, objectives, tags,
      isActive, isPublished, isFeatured, totalDuration, totalCours
    } = req.body;

    // Validation du titre
    if (!titre) {
      return res.status(400).json({
        success: false,
        message: 'Le titre est requis'
      });
    }

    // Vérification d'unicité du slug
    if (slug) {
      const existingSlug = await Formation.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug existe déjà'
        });
      }
    }

    // Vérification de la catégorie
    if (categorie) {
      const categorieExists = await Categorie.findById(categorie);
      if (!categorieExists) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
    }

    // Vérification de l'enseignant
    if (enseignant) {
      const enseignantExists = await Utilisateur.findById(enseignant);
      if (!enseignantExists) {
        return res.status(400).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    const formation = new Formation({
      titre, description, shortDescription, image,
      prix: prix || 0, originalPrice,
      categorie, enseignant,
      slug, difficulty: difficulty || 'debutant',
      language: language || 'fr',
      prerequisites: prerequisites || [],
      objectives: objectives || [],
      tags: tags ? tags.map(t => t.toLowerCase()) : [],
      isActive: isActive !== undefined ? isActive : true,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      totalDuration: totalDuration || 0,
      totalCours: totalCours || 0
    });

    await formation.save();

    const populatedFormation = await Formation.findById(formation._id)
      .populate('categorie', 'nom slug')
      .populate('enseignant', 'nom email');

    res.status(201).json({
      success: true,
      message: 'Formation créée avec succès',
      data: populatedFormation
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la formation',
      error: error.message
    });
  }
};

/**
 * Mettre à jour une formation
 * PUT /api/formations/:id
 */
exports.updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const formation = await Formation.findById(id);
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Vérification d'unicité du slug si modifié
    if (updateData.slug && updateData.slug !== formation.slug) {
      const existingSlug = await Formation.findOne({ slug: updateData.slug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug existe déjà'
        });
      }
    }

    // Vérification de la catégorie si modifiée
    if (updateData.categorie && updateData.categorie !== formation.categorie?.toString()) {
      const categorieExists = await Categorie.findById(updateData.categorie);
      if (!categorieExists) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
    }

    // Vérification de l'enseignant si modifié
    if (updateData.enseignant && updateData.enseignant !== formation.enseignant?.toString()) {
      const enseignantExists = await Utilisateur.findById(updateData.enseignant);
      if (!enseignantExists) {
        return res.status(400).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    // Normaliser les tags en minuscules
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.map(t => t.toLowerCase());
    }

    const updatedFormation = await Formation.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('categorie', 'nom slug')
     .populate('enseignant', 'nom email');

    res.status(200).json({
      success: true,
      message: 'Formation mise à jour avec succès',
      data: updatedFormation
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la formation',
      error: error.message
    });
  }
};

/**
 * Supprimer une formation
 * DELETE /api/formations/:id
 * 
 * IMPORTANT: Seul les administrateurs peuvent supprimer une formation.
 * Cette vérification est appliquée par le middleware restrictTo('admin')
 * et doublée ici par défense en profondeur.
 */
exports.deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;

    // Double-check: Ensure user is admin (middleware already enforces this)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seul un administrateur peut supprimer une formation'
      });
    }

    const formation = await Formation.findById(id);
    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Vérification si la formation a des inscriptions
    if (formation.enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une formation qui a des inscriptions'
      });
    }

    await Formation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Formation supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la formation',
      error: error.message
    });
  }
};

/**
 * Récupérer les formations mises en avant
 * GET /api/formations/featured
 */
exports.getFeaturedFormations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const formations = await Formation.find({
      isActive: true,
      isPublished: true,
      isFeatured: true
    })
      .populate('categorie', 'nom slug')
      .populate('enseignant', 'nom email')
      .sort({ '-rating': -1, 'createdAt': -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Formations mises en avant récupérées avec succès',
      data: formations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations mises en avant',
      error: error.message
    });
  }
};

/**
 * Récupérer une formation par son slug
 * GET /api/formations/slug/:slug
 */
exports.getFormationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const formation = await Formation.findOne({ slug })
      .populate('categorie', 'nom slug description')
      .populate('enseignant', 'nom email photo bio');

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Formation récupérée avec succès',
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la formation',
      error: error.message
    });
  }
};

/**
 * Récupérer les formations d'une catégorie
 * GET /api/formations/categorie/:categorieId
 */
exports.getFormationsByCategorie = async (req, res) => {
  try {
    const { categorieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Vérifier que la catégorie existe
    const categorie = await Categorie.findById(categorieId);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    const [formations, total] = await Promise.all([
      Formation.find({
        categorie: categorieId,
        isActive: true,
        isPublished: true
      })
        .populate('categorie', 'nom slug')
        .populate('enseignant', 'nom email')
        .sort({ 'rating': -1, 'createdAt': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Formation.countDocuments({
        categorie: categorieId,
        isActive: true,
        isPublished: true
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Formations de la catégorie récupérées avec succès',
      data: {
        categorie,
        formations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

/**
 * Récupérer les formations d'un enseignant
 * GET /api/formations/enseignant/:enseignantId
 */
exports.getFormationsByEnseignant = async (req, res) => {
  try {
    const { enseignantId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Vérifier que l'enseignant existe
    const enseignant = await Utilisateur.findById(enseignantId);
    if (!enseignant) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    const [formations, total] = await Promise.all([
      Formation.find({ enseignant: enseignantId })
        .populate('categorie', 'nom slug')
        .populate('enseignant', 'nom email photo')
        .sort({ 'createdAt': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Formation.countDocuments({ enseignant: enseignantId })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Formations de l\'enseignant récupérées avec succès',
      data: {
        enseignant,
        formations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

/**
 * Récupérer les formations par niveau de difficulté
 * GET /api/formations/difficulty/:difficulty
 */
exports.getFormationsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Valider le niveau de difficulté
    const validDifficulties = ['debutant', 'intermediaire', 'avance'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Niveau de difficulté invalide. Valeurs acceptées: ${validDifficulties.join(', ')}`
      });
    }

    const [formations, total] = await Promise.all([
      Formation.find({
        difficulty,
        isActive: true,
        isPublished: true
      })
        .populate('categorie', 'nom slug')
        .populate('enseignant', 'nom email')
        .sort({ 'enrollmentCount': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Formation.countDocuments({
        difficulty,
        isActive: true,
        isPublished: true
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: `Formations de niveau ${difficulty} récupérées avec succès`,
      data: {
        difficulty,
        formations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

/**
 * Récupérer les formations les mieux notées
 * GET /api/formations/top-rated
 */
exports.getTopRatedFormations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const minRating = parseFloat(req.query.minRating) || 4;

    const formations = await Formation.find({
      isActive: true,
      isPublished: true,
      rating: { $gte: minRating }
    })
      .populate('categorie', 'nom slug')
      .populate('enseignant', 'nom email')
      .sort({ 'rating': -1, 'reviewCount': -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Formations les mieux notées récupérées avec succès',
      data: formations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

/**
 * Recherche textuelle des formations
 * GET /api/formations/search
 */
exports.searchFormations = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La requête de recherche doit contenir au moins 2 caractères'
      });
    }

    const searchFilter = {
      $or: [
        { titre: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ],
      isActive: true,
      isPublished: true
    };

    const [formations, total] = await Promise.all([
      Formation.find(searchFilter)
        .populate('categorie', 'nom slug')
        .populate('enseignant', 'nom email')
        .sort({ 'rating': -1, 'enrollmentCount': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Formation.countDocuments(searchFilter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Résultats de recherche récupérés avec succès',
      data: {
        query: q,
        formations,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de formations',
      error: error.message
    });
  }
};
