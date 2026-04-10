const mongoose = require('mongoose');

/**
 * Schéma Commentaire
 * Représente les commentaires sur les publications avec support des réponses imbriquées
 */
const commentaireSchema = new mongoose.Schema({
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true,
    minlength: [1, 'Le commentaire ne peut pas être vide'],
    maxlength: [5000, 'Le commentaire ne peut pas dépasser 5000 caractères']
  },
  
  // Références
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  publication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication',
    required: true
  },
  
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commentaire',
    default: null
  },
  
  // Médias
  mediaUrl: {
    type: String,
    maxlength: 500
  },
  
  mediaType: {
    type: String,
    maxlength: 100
  },
  
  // Engagement
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  repliesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Modération
  isReported: {
    type: Boolean,
    default: false
  },
  
  reportCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
commentaireSchema.index({ auteur: 1 });
commentaireSchema.index({ publication: 1 });
commentaireSchema.index({ parent: 1 });
commentaireSchema.index({ isActive: 1 });
commentaireSchema.index({ isPinned: 1 });
commentaireSchema.index({ createdAt: -1 });
commentaireSchema.index({ publication: 1, isActive: 1, createdAt: -1 });

const Commentaire = mongoose.model('Commentaire', commentaireSchema);

module.exports = Commentaire;
