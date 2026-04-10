const mongoose = require('mongoose');

/**
 * Schéma Progression
 * Suit la progression des étudiants à travers les cours et formations
 */
const progressionSchema = new mongoose.Schema({
  // Références
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true
  },
  
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  },
  
  // Statut de progression
  statut: {
    type: String,
    enum: ['non_commence', 'en_cours', 'termine', 'abandonne'],
    default: 'non_commence'
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Timing
  dateDebut: {
    type: Date
  },
  
  dateFin: {
    type: Date
  },
  
  lastAccessDate: {
    type: Date
  },
  
  // Suivi du temps
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Temps total en secondes'
  },
  
  sessionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  averageSessionDuration: {
    type: Number,
    min: 0,
    comment: 'Durée moyenne de session en secondes'
  },
  
  // Suivi du contenu
  lastPosition: {
    type: String,
    maxlength: 100,
    comment: 'Dernière position dans le cours (horodatage vidéo, position de défilement, etc.)'
  },
  
  contentProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Notes et signets
  notes: {
    type: String,
    trim: true
  },
  
  bookmarks: [{
    position: String,
    label: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Complétion
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completionScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index - index composé pour combinaison unique étudiant-cours
progressionSchema.index({ etudiant: 1, cours: 1 }, { unique: true });
progressionSchema.index({ etudiant: 1 });
progressionSchema.index({ cours: 1 });
progressionSchema.index({ formation: 1 });
progressionSchema.index({ statut: 1 });
progressionSchema.index({ isCompleted: 1 });
progressionSchema.index({ etudiant: 1, formation: 1 });

const Progression = mongoose.model('Progression', progressionSchema);

module.exports = Progression;
