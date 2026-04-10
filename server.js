require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

// Importation des routes
const setupRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Active CORS pour permettre les requêtes cross-origin depuis d'autres domaines
app.use(cors());
// Parse les requêtes entrantes avec des données JSON
app.use(express.json());
// Parse les requêtes entrantes avec des données URL-encoded (formulaires HTML)
app.use(express.urlencoded({ extended: true }));

// Routes API
setupRoutes(app);

// Route de vérification de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
