/**
 * ===========================================
 * ASYNC HANDLER - WRAPPER POUR FONCTIONS ASYNC
 * ===========================================
 * 
 * Évite de répéter try-catch dans chaque contrôleur
 * 
 * Bonne Pratique : Centraliser la gestion des erreurs
 * async pour un code plus propre et DRY
 */

/**
 * Wrapper pour les fonctions async dans les contrôleurs
 * Attrape automatiquement les erreurs et les passe à next()
 * 
 * @param {Function} fn - Fonction async du contrôleur
 * @returns {Function} Middleware Express
 * 
 * @example
 * // Sans asyncHandler (verbeux)
 * exports.getUsers = async (req, res, next) => {
 *   try {
 *     const users = await Utilisateur.find();
 *     res.json({ users });
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 * 
 * // Avec asyncHandler (propre)
 * exports.getUsers = asyncHandler(async (req, res) => {
 *   const users = await Utilisateur.find();
 *   res.json({ users });
 * });
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
