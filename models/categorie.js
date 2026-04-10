const mongoose = require('mongoose');

/**
 * Schéma Catégorie
 * Représente les catégories pour organiser les formations avec support hiérarchique
 */
const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  
  description: {
    type: String,
    trim: true
  },
  
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  
  // Hiérarchie
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    default: null
  },
  
  level: {
    type: Number,
    default: 0,
    min: 0
  },
  
  path: {
    type: String,
    default: ''
  },
  
  // Affichage
  icon: {
    type: String,
    maxlength: 100
  },
  
  color: {
    type: String,
    maxlength: 20
  },
  
  imageUrl: {
    type: String,
    maxlength: 500
  },
  
  ordre: {
    type: Number,
    default: 0
  },
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Statistiques
  formationsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // SEO
  metaTitle: {
    type: String,
    maxlength: 100
  },
  
  metaDescription: {
    type: String,
    maxlength: 255
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
categorieSchema.index({ nom: 1 });
categorieSchema.index({ slug: 1 }, { unique: true, sparse: true });
categorieSchema.index({ parent: 1 });
categorieSchema.index({ isActive: 1 });
categorieSchema.index({ isFeatured: 1 });
categorieSchema.index({ ordre: 1 });
categorieSchema.index({ level: 1 });

const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;
