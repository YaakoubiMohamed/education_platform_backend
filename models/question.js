const mongoose = require('mongoose');

/**
 * Schéma Question
 * Représente les questions de quiz avec une configuration complète
 */
const questionSchema = new mongoose.Schema({
  texte: {
    type: String,
    required: [true, 'Le texte de la question est requis'],
    trim: true
  },
  
  type: {
    type: String,
    enum: ['choix_multiple', 'vrai_faux', 'reponse_libre', 'correspondance', 'ordonnancement', 'remplir_blancs'],
    required: [true, 'Le type de question est requis']
  },
  
  // Référence
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  
  // Notation
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  
  negativePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  partialCredit: {
    type: Boolean,
    default: false
  },
  
  // Ordre et affichage
  ordre: {
    type: Number,
    default: 1,
    min: 0
  },
  
  isRequired: {
    type: Boolean,
    default: true
  },
  
  // Temps
  timeLimit: {
    type: Number,
    min: 0,
    comment: 'Limite de temps en secondes'
  },
  
  // Contenu
  explanation: {
    type: String,
    trim: true
  },
  
  hint: {
    type: String,
    trim: true
  },
  
  mediaUrl: {
    type: String,
    maxlength: 500
  },
  
  mediaType: {
    type: String,
    enum: ['image', 'audio', 'video', 'document']
  },
  
  // Difficulté
  difficulty: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  },
  
  category: {
    type: String,
    trim: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Answer configuration (for free text)
  correctAnswer: {
    type: String,
    trim: true
  },
  
  answerOptions: [{
    type: String,
    trim: true
  }],
  
  caseSensitive: {
    type: Boolean,
    default: false
  },
  
  // Randomisation
  randomizeChoices: {
    type: Boolean,
    default: false
  },
  
  // Statistiques
  timesUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  timesCorrect: {
    type: Number,
    default: 0,
    min: 0
  },
  
  averageTime: {
    type: Number,
    min: 0,
    comment: 'Temps moyen en secondes'
  },
  
  // Créateur
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
questionSchema.index({ quiz: 1, ordre: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdBy: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
