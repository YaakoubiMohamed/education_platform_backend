const mongoose = require('mongoose');

/**
 * Schéma Cours
 * Représente les leçons/cours individuels au sein d'une formation
 */
const coursSchema = new mongoose.Schema({
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
  
  contenu: {
    type: String,
    trim: true
  },
  
  type: {
    type: String,
    enum: ['vidéo', 'texte', 'document', 'image', 'audio'],
    required: [true, 'Le type de cours est requis']
  },
  
  // Références
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  },
  
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  // Ordre et structure
  ordre: {
    type: Number,
    default: 1,
    min: 0
  },
  
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets']
  },
  
  // Métadonnées du cours
  duration: {
    type: Number,
    min: 0
  },
  
  difficulty: {
    type: String,
    enum: ['debutant', 'intermediaire', 'avance'],
    default: 'debutant'
  },
  
  // Informations du fichier
  fileUrl: {
    type: String,
    maxlength: 500
  },
  
  fileName: {
    type: String,
    maxlength: 255
  },
  
  fileSize: {
    type: Number,
    min: 0
  },
  
  fileMimeType: {
    type: String,
    maxlength: 100
  },
  
  thumbnailUrl: {
    type: String,
    maxlength: 500
  },
  
  // Statut
  isPublished: {
    type: Boolean,
    default: false
  },
  
  isPreview: {
    type: Boolean,
    default: false
  },
  
  // Engagement
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completionCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
coursSchema.index({ formation: 1 });
coursSchema.index({ enseignant: 1 });
coursSchema.index({ ordre: 1 });
coursSchema.index({ isPublished: 1 });
coursSchema.index({ slug: 1 });
coursSchema.index({ formation: 1, ordre: 1 });

const Cours = mongoose.model('Cours', coursSchema);

module.exports = Cours;
