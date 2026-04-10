const mongoose = require('mongoose');

/**
 * Schéma Publication
 * Représente les posts/publications dans les fonctionnalités sociales de la plateforme
 */
const publicationSchema = new mongoose.Schema({
  titre: {
    type: String,
    trim: true,
    maxlength: 255
  },
  
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true
  },
  
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'link', 'announcement'],
    default: 'text'
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
  
  thumbnailUrl: {
    type: String,
    maxlength: 500
  },
  
  // Métadonnées
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  slug: {
    type: String,
    trim: true
  },
  
  // Références
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  groupe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Groupe'
  },
  
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  },
  
  // Engagement
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Utilisateurs qui ont aimé
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  }],
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  visibility: {
    type: String,
    enum: ['public', 'group', 'private'],
    default: 'public'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
publicationSchema.index({ auteur: 1 });
publicationSchema.index({ groupe: 1 });
publicationSchema.index({ formation: 1 });
publicationSchema.index({ isActive: 1 });
publicationSchema.index({ isPinned: -1, createdAt: -1 });
publicationSchema.index({ visibility: 1 });
publicationSchema.index({ tags: 1 });

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
