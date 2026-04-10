/**
 * ===========================================
 * CONTRÔLEUR UTILISATEUR
 * ===========================================
 * 
 * Gère toutes les opérations CRUD pour les utilisateurs
 * 
 * Bonnes Pratiques :
 * - Contrôleurs fins (logique métier dans les services)
 * - Utilisation de asyncHandler pour éviter try-catch
 * - Réponses cohérentes
 * - Filtrage des champs sensibles
 */

const User = require('../models/utilisateur');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../middleware/asyncHandler');

// ===========================================
// CHAMPS AUTORISÉS POUR LES MISES À JOUR
// ===========================================

const ALLOWED_UPDATE_FIELDS = ['name', 'email', 'role'];
const ALLOWED_CREATE_FIELDS = ['name', 'email', 'password', 'role'];

/**
 * Filtre un objet pour ne garder que les champs autorisés
 * @param {Object} obj - Objet à filtrer
 * @param {Array} allowedFields - Champs autorisés
 * @returns {Object} Objet filtré
 */
const filterObject = (obj, allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

// ===========================================
// CRUD OPERATIONS
// ===========================================

/**
 * @desc    Obtenir tous les utilisateurs avec pagination et filtrage
 * @route   GET /api/v1/users
 * @access  Public
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  // Extraire les paramètres de requête
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    fields,
    role,
    ...filters
  } = req.query;

  // Construire les filtres
  const queryFilters = { ...filters };
  if (role) queryFilters.role = role;

  // Utiliser la méthode statique de recherche
  const result = await User.search(queryFilters, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    fields,
  });

  res.status(200).json({
    status: 'success',
    results: result.users.length,
    totalResults: result.total,
    page: result.page,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
    data: {
      users: result.users,
    },
  });
});

/**
 * @desc    Obtenir un utilisateur par ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * @desc    Créer un nouvel utilisateur
 * @route   POST /api/v1/users
 * @access  Public
 */
exports.createUser = asyncHandler(async (req, res) => {
  // Filtrer les champs autorisés (sécurité)
  const filteredBody = filterObject(req.body, ALLOWED_CREATE_FIELDS);

  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email: filteredBody.email });
  if (existingUser) {
    throw ApiError.conflict('Cet email est déjà utilisé');
  }

  // Créer l'utilisateur
  const newUser = await User.create(filteredBody);

  // Réponse avec le code 201 Created
  res
    .status(201)
    .location(`/api/v1/users/${newUser._id}`)
    .json({
      status: 'success',
      message: 'Utilisateur créé avec succès',
      data: {
        user: newUser,
      },
    });
});

/**
 * @desc    Mettre à jour un utilisateur (remplacement complet)
 * @route   PUT /api/v1/users/:id
 * @access  Public
 */
exports.updateUser = asyncHandler(async (req, res) => {
  // Filtrer les champs autorisés
  const filteredBody = filterObject(req.body, ALLOWED_UPDATE_FIELDS);

  // Vérifier que tous les champs requis sont présents (PUT = remplacement complet)
  const missingFields = ALLOWED_UPDATE_FIELDS.filter(
    (field) => !filteredBody[field] && field !== 'role'
  );
  
  if (missingFields.length > 0) {
    throw ApiError.badRequest(
      `Les champs suivants sont requis pour PUT: ${missingFields.join(', ')}`
    );
  }

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  if (filteredBody.email) {
    const existingUser = await User.findOne({
      email: filteredBody.email,
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      throw ApiError.conflict('Cet email est déjà utilisé');
    }
  }

  // Mettre à jour l'utilisateur
  const user = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,           // Retourner le document mis à jour
      runValidators: true, // Exécuter les validateurs Mongoose
    }
  );

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur mis à jour avec succès',
    data: {
      user,
    },
  });
});

/**
 * @desc    Mettre à jour partiellement un utilisateur
 * @route   PATCH /api/v1/users/:id
 * @access  Public
 */
exports.partialUpdateUser = asyncHandler(async (req, res) => {
  // Filtrer les champs autorisés
  const filteredBody = filterObject(req.body, ALLOWED_UPDATE_FIELDS);

  // Vérifier qu'il y a au moins un champ à mettre à jour
  if (Object.keys(filteredBody).length === 0) {
    throw ApiError.badRequest('Aucun champ valide à mettre à jour');
  }

  // Vérifier si l'email est déjà utilisé par un autre utilisateur
  if (filteredBody.email) {
    const existingUser = await User.findOne({
      email: filteredBody.email,
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      throw ApiError.conflict('Cet email est déjà utilisé');
    }
  }

  // Mettre à jour l'utilisateur
  const user = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur mis à jour avec succès',
    data: {
      user,
    },
  });
});

/**
 * @desc    Supprimer un utilisateur (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Public
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  // Soft delete : marquer comme inactif
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  // Réponse 204 No Content (pas de corps)
  res.status(204).send();
});

// ===========================================
// OPÉRATIONS SUPPLÉMENTAIRES
// ===========================================

/**
 * @desc    Obtenir le profil complet d'un utilisateur
 * @route   GET /api/v1/users/:id/profile
 * @access  Public
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  // Construire le profil étendu
  const profile = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    profileUrl: user.profileUrl,
    isEmailVerified: user.isEmailVerified,
    memberSince: user.createdAt,
    lastUpdated: user.updatedAt,
  };

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

/**
 * @desc    Obtenir les statistiques des utilisateurs
 * @route   GET /api/v1/users/stats
 * @access  Public
 */
exports.getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getStats();

  // Calculer le total
  const total = stats.reduce((acc, curr) => acc + curr.count, 0);

  res.status(200).json({
    status: 'success',
    data: {
      total,
      byRole: stats,
    },
  });
});

/**
 * @desc    Rechercher des utilisateurs
 * @route   GET /api/v1/users/search
 * @access  Public
 */
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    throw ApiError.badRequest('Le terme de recherche doit contenir au moins 2 caractères');
  }

  // Recherche par texte ou regex
  const searchRegex = new RegExp(q, 'i');
  const filters = {
    $or: [
      { name: searchRegex },
      { email: searchRegex },
    ],
  };

  const result = await User.search(filters, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  res.status(200).json({
    status: 'success',
    query: q,
    results: result.users.length,
    totalResults: result.total,
    data: {
      users: result.users,
    },
  });
});

/**
 * @desc    Restaurer un utilisateur supprimé
 * @route   PATCH /api/v1/users/:id/restore
 * @access  Admin
 */
exports.restoreUser = asyncHandler(async (req, res) => {
  // Chercher l'utilisateur inactif
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  ).setOptions({ includeInactive: true });

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur restauré avec succès',
    data: {
      user,
    },
  });
});

/**
 * @desc    Supprimer définitivement un utilisateur
 * @route   DELETE /api/v1/users/:id/permanent
 * @access  Admin
 */
exports.permanentDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
    .setOptions({ includeInactive: true });

  if (!user) {
    throw ApiError.notFound(`Aucun utilisateur trouvé avec l'ID: ${req.params.id}`);
  }

  res.status(204).send();
});
