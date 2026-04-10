/**
 * ===========================================
 * CONFIGURATION DE LA BASE DE DONNÉES
 * ===========================================
 * 
 * Gère la connexion MongoDB avec Mongoose
 * 
 * Bonnes Pratiques :
 * - Pool de connexions configuré
 * - Gestion des événements de connexion
 * - Reconnexion automatique
 * - Arrêt gracieux
 */

const mongoose = require('mongoose');

// ===========================================
// OPTIONS DE CONNEXION
// ===========================================

const connectionOptions = {
  // Pool de connexions
  maxPoolSize: 10,           // Max connexions simultanées
  minPoolSize: 2,            // Min connexions maintenues
  
  // Timeouts
  serverSelectionTimeoutMS: 5000,  // Timeout sélection serveur
  socketTimeoutMS: 45000,          // Timeout des sockets
  connectTimeoutMS: 10000,         // Timeout de connexion
  
  // Comportement
  retryWrites: true,         // Réessayer les écritures échouées
  w: 'majority',             // Write concern
  
  // Heartbeat
  heartbeatFrequencyMS: 10000,
};

// ===========================================
// CONNEXION À LA BASE DE DONNÉES
// ===========================================

/**
 * Établit la connexion à MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI n\'est pas défini dans les variables d\'environnement');
    }

    // Connexion
    const conn = await mongoose.connect(mongoUri, connectionOptions);

    console.log(`
╔═══════════════════════════════════════════════════════╗
║         📦 MONGODB CONNECTÉ AVEC SUCCÈS !            ║
╠═══════════════════════════════════════════════════════╣
║   🏠 Hôte     : ${conn.connection.host.padEnd(36)}║
║   📊 Database : ${conn.connection.name.padEnd(36)}║
║   🔌 Port     : ${String(conn.connection.port).padEnd(36)}║
╚═══════════════════════════════════════════════════════╝
    `);

    // ===========================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ===========================================

    // Erreur de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err.message);
    });

    // Déconnexion
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB déconnecté');
    });

    // Reconnexion
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnecté');
    });

    // Connexion fermée
    mongoose.connection.on('close', () => {
      console.log('🔒 Connexion MongoDB fermée');
    });

  } catch (error) {
    console.error('❌ Échec de connexion MongoDB:', error.message);
    
    // En développement, afficher plus de détails
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
    
    throw error;
  }
};

// ===========================================
// DÉCONNEXION DE LA BASE DE DONNÉES
// ===========================================

/**
 * Ferme proprement la connexion MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ Connexion MongoDB fermée proprement');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture MongoDB:', error.message);
    throw error;
  }
};

// ===========================================
// UTILITAIRES
// ===========================================

/**
 * Vérifie si la connexion est active
 * @returns {boolean}
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Retourne l'état de la connexion
 * @returns {string}
 */
const getConnectionState = () => {
  const states = {
    0: 'déconnecté',
    1: 'connecté',
    2: 'connexion en cours',
    3: 'déconnexion en cours',
  };
  return states[mongoose.connection.readyState] || 'inconnu';
};

/**
 * Retourne les statistiques de connexion
 * @returns {Object}
 */
const getConnectionStats = () => {
  const conn = mongoose.connection;
  return {
    state: getConnectionState(),
    host: conn.host,
    port: conn.port,
    name: conn.name,
    models: Object.keys(mongoose.models),
  };
};

// ===========================================
// EXPORTS
// ===========================================

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionState,
  getConnectionStats,
};
