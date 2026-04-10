const Categorie = require('../models/categorie');

/**
 * Récupérer toutes les catégories avec pagination et filtres
 * GET /api/categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.isFeatured !== undefined) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }

    if (req.query.parent === 'null') {
      filter.parent = null;
    } else if (req.query.parent) {
      filter.parent = req.query.parent;
    }

    if (req.query.search) {
      filter.nom = { $regex: req.query.search, $options: 'i' };
    }

    const sortField = req.query.sortBy || 'ordre';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    const [categories, total] = await Promise.all([
      Categorie.find(filter)
        .populate('parent', 'nom slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Categorie.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Catégories récupérées avec succès',
      data: {
        categories,
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
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};

/**
 * Récupérer une catégorie par son ID
 * GET /api/categories/:id
 */
exports.getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await Categorie.findById(id)
      .populate('parent', 'nom slug');

    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Catégorie récupérée avec succès',
      data: categorie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: error.message
    });
  }
};

/**
 * Créer une nouvelle catégorie
 * POST /api/categories
 */
exports.createCategorie = async (req, res) => {
  try {
    const {
      nom, description, slug, parent,
      icon, color, imageUrl, ordre,
      isActive, isFeatured, metaTitle, metaDescription
    } = req.body;

    if (slug) {
      const existingSlug = await Categorie.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug existe déjà'
        });
      }
    }

    let level = 0;
    let path = '';

    if (parent) {
      const parentCategorie = await Categorie.findById(parent);
      if (!parentCategorie) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie parente non trouvée'
        });
      }
      level = parentCategorie.level + 1;
      path = parentCategorie.path 
        ? `${parentCategorie.path},${parent}` 
        : parent.toString();
    }

    const categorie = new Categorie({
      nom, description, slug,
      parent: parent || null,
      level, path,
      icon, color, imageUrl,
      ordre: ordre || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      metaTitle, metaDescription
    });

    await categorie.save();

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: categorie
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
      message: 'Erreur lors de la création de la catégorie',
      error: error.message
    });
  }
};

/**
 * Mettre à jour une catégorie
 * PUT /api/categories/:id
 */
exports.updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const categorie = await Categorie.findById(id);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    if (updateData.slug && updateData.slug !== categorie.slug) {
      const existingSlug = await Categorie.findOne({ slug: updateData.slug });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Ce slug existe déjà'
        });
      }
    }

    if (updateData.parent !== undefined && 
        updateData.parent !== categorie.parent?.toString()) {
      
      if (updateData.parent === null || updateData.parent === '') {
        updateData.level = 0;
        updateData.path = '';
        updateData.parent = null;
      } else {
        if (updateData.parent === id) {
          return res.status(400).json({
            success: false,
            message: 'Une catégorie ne peut pas être son propre parent'
          });
        }

        const parentCategorie = await Categorie.findById(updateData.parent);
        if (!parentCategorie) {
          return res.status(400).json({
            success: false,
            message: 'Catégorie parente non trouvée'
          });
        }

        if (parentCategorie.path && parentCategorie.path.includes(id)) {
          return res.status(400).json({
            success: false,
            message: 'Référence circulaire détectée'
          });
        }

        updateData.level = parentCategorie.level + 1;
        updateData.path = parentCategorie.path 
          ? `${parentCategorie.path},${updateData.parent}` 
          : updateData.parent;
      }
    }

    const updatedCategorie = await Categorie.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('parent', 'nom slug');

    res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: updatedCategorie
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
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: error.message
    });
  }
};

/**
 * Supprimer une catégorie
 * DELETE /api/categories/:id
 */
exports.deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await Categorie.findById(id);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    const hasChildren = await Categorie.exists({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une catégorie qui contient des sous-catégories'
      });
    }

    if (categorie.formationsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une catégorie qui contient des formations'
      });
    }

    await Categorie.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie',
      error: error.message
    });
  }
};

/**
 * Récupérer l'arborescence complète des catégories
 * GET /api/categories/tree
 */
exports.getCategoriesTree = async (req, res) => {
  try {
    const categories = await Categorie.find({ isActive: true })
      .sort({ ordre: 1, nom: 1 })
      .lean();

    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => {
          const itemParent = item.parent ? item.parent.toString() : null;
          return itemParent === parentId;
        })
        .map(item => ({
          ...item,
          children: buildTree(items, item._id.toString())
        }));
    };

    const tree = buildTree(categories);

    res.status(200).json({
      success: true,
      message: 'Arborescence des catégories récupérée avec succès',
      data: tree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'arborescence',
      error: error.message
    });
  }
};

/**
 * Récupérer les sous-catégories d'une catégorie
 * GET /api/categories/:id/children
 */
exports.getSubCategories = async (req, res) => {
  try {
    const { id } = req.params;

    const parentCategorie = await Categorie.findById(id);
    if (!parentCategorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie parente non trouvée'
      });
    }

    const subCategories = await Categorie.find({ parent: id })
      .sort({ ordre: 1, nom: 1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Sous-catégories récupérées avec succès',
      data: subCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sous-catégories',
      error: error.message
    });
  }
};

/**
 * Récupérer les catégories mises en avant
 * GET /api/categories/featured
 */
exports.getFeaturedCategories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const categories = await Categorie.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ ordre: 1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Catégories mises en avant récupérées avec succès',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories mises en avant',
      error: error.message
    });
  }
};

/**
 * Récupérer une catégorie par son slug
 * GET /api/categories/slug/:slug
 */
exports.getCategorieBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const categorie = await Categorie.findOne({ slug })
      .populate('parent', 'nom slug');

    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Catégorie récupérée avec succès',
      data: categorie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: error.message
    });
  }
};