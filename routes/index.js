/**
 * ===========================================
 * CENTRALIZED ROUTES INDEX
 * ===========================================
 * 
 * This file centralizes all routes from the application.
 * Import all route files here and register them with the app.
 */

const authRoutes = require('./authRoutes');
const categorieRoutes = require('./categorieRoutes');
const userRoutes = require('./userRoutes');
const formationRoutes = require('./formationRoutes');

/**
 * Register all routes
 * @param {Express.Application} app - Express application instance
 */


const setupRoutes = (app) => {

  // Auth routes
  app.use('/api/auth', authRoutes);

  // Category routes
  app.use('/api/categories', categorieRoutes);

  // User routes
  app.use('/api/users', userRoutes);

  // Formation routes
  app.use('/api/formations', formationRoutes);
};

module.exports = setupRoutes;
