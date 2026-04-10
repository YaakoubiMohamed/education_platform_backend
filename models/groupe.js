const mongoose = require('mongoose');

/**
 * Schéma Groupe
 * Représente les groupes d'utilisateurs pour la collaboration et l'organisation
 */
const groupeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
    maxlength: [255, 'Le nom ne peut pas dépasser 255 caractères']
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
  
  // Références
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  moderateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  },
  
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie'
  },
  
  // Paramètres
  type: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  joinPolicy: {
    type: String,
    enum: ['open', 'approval', 'invite-only'],
    default: 'open'
  },
  
  // Adhésion
  maxMembers: {
    type: Number,
    min: 1
  },
  
  currentMembers: {
    type: Number,
    default: 1,
    min: 0
  },
  
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      maxlength: 500
    }
  }],
  
  // Médias
  avatar: {
    type: String,
    maxlength: 500
  },
  
  coverImage: {
    type: String,
    maxlength: 500
  },
  
  // Fonctionnalités et permissions
  features: {
    discussions: { type: Boolean, default: true },
    fileSharing: { type: Boolean, default: true },
    events: { type: Boolean, default: false },
    polls: { type: Boolean, default: false },
    announcements: { type: Boolean, default: true }
  },
  
  permissions: {
    memberCanPost: { type: Boolean, default: true },
    memberCanInvite: { type: Boolean, default: false },
    memberCanCreateEvents: { type: Boolean, default: false },
    moderationRequired: { type: Boolean, default: false }
  },
  
  // Statistiques
  postsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
groupeSchema.index({ nom: 1 });
groupeSchema.index({ slug: 1 }, { unique: true, sparse: true });
groupeSchema.index({ createur: 1 });
groupeSchema.index({ formation: 1 });
groupeSchema.index({ type: 1 });
groupeSchema.index({ isActive: 1 });
groupeSchema.index({ 'members.user': 1 });

const Groupe = mongoose.model('Groupe', groupeSchema);

module.exports = Groupe;
