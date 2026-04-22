const mongoose = require('mongoose');

/**
 * Schéma Formation
 * Représente les programmes de formation dans la plateforme éducative
 */
const formationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    minlength: [3, 'Le titre doit contenir au moins 3 caractères'],
    maxlength: [255, 'Le titre ne peut pas dépasser 255 caractères']
  },
  
  description: {
    type: String,
    trim: true
  },
  
  shortDescription: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  image: {
    type: String,
    maxlength: 500
  },
  
  prix: {
    type: Number,
    default: 0,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  
  originalPrice: {
    type: Number,
    min: 0
  },
  
  // Références
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie'
  },
  
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPublished: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Statistiques
  enrollmentCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalCours: {
    type: Number,
    default: 0,
    min: 0
  },
  
  difficulty: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance'],
    default: 'debutant'
  },
  
  language: {
    type: String,
    default: 'fr'
  },
  
  prerequisites: [{
    type: String,
    trim: true
  }],
  
  objectives: [{
    type: String,
    trim: true
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
formationSchema.index({ categorie: 1 });
formationSchema.index({ enseignant: 1 });
formationSchema.index({ isActive: 1, isPublished: 1 });
formationSchema.index({ prix: 1 });
formationSchema.index({ rating: -1 });
formationSchema.index({ enrollmentCount: -1 });
formationSchema.index({ tags: 1 });
formationSchema.index({ '$**': 'text' });

const Formation = mongoose.model('Formation', formationSchema);

module.exports = Formation;
