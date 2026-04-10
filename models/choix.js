const mongoose = require('mongoose');

/**
 * Schéma Choix
 * Représente les choix de réponse pour les questions de quiz
 */
const choixSchema = new mongoose.Schema({
  texte: {
    type: String,
    required: [true, 'Le texte du choix est requis'],
    trim: true
  },
  
  estCorrect: {
    type: Boolean,
    default: false
  },
  
  partialCredit: {
    type: Number,
    min: 0,
    max: 100,
    comment: 'Pourcentage de crédit partiel (0-100)'
  },
  
  // Référence
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  // Affichage
  ordre: {
    type: Number,
    default: 1,
    min: 0
  },
  
  // Médias
  mediaUrl: {
    type: String,
    maxlength: 500
  },
  
  mediaType: {
    type: String,
    enum: ['image', 'audio', 'video']
  },
  
  // Feedback
  explanation: {
    type: String,
    trim: true
  },
  
  feedbackIfSelected: {
    type: String,
    trim: true
  },
  
  // Correspondance/ordonnancement
  matchingPair: {
    type: String,
    maxlength: 255
  },
  
  correctPosition: {
    type: Number,
    min: 0
  },
  
  // Statistiques
  timesSelected: {
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
choixSchema.index({ question: 1, ordre: 1 });
choixSchema.index({ estCorrect: 1 });
choixSchema.index({ createdBy: 1 });

const Choix = mongoose.model('Choix', choixSchema);

module.exports = Choix;
