const mongoose = require('mongoose');

/**
 * Schéma ReponseEtudiant
 * Suit les réponses individuelles des étudiants aux questions de quiz
 */
const reponseEtudiantSchema = new mongoose.Schema({
  // Références
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSession'
  },
  
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  
  choixSelectionne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Choix'
  },
  
  // Données de réponse
  reponseTexte: {
    type: String,
    trim: true
  },
  
  selectedChoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Choix'
  }],
  
  // Grading
  isCorrect: {
    type: Boolean
  },
  
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  pointsPossible: {
    type: Number,
    min: 0
  },
  
  partialCreditPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Timing
  timeSpent: {
    type: Number,
    min: 0,
    comment: 'Temps passé en secondes'
  },
  
  startedAt: {
    type: Date
  },
  
  answeredAt: {
    type: Date
  },
  
  // Suivi du comportement
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  
  revisionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  skipped: {
    type: Boolean,
    default: false
  },
  
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  
  // Confiance et difficulté
  confidenceLevel: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high']
  },
  
  perceivedDifficulty: {
    type: String,
    enum: ['very_easy', 'easy', 'medium', 'hard', 'very_hard']
  },
  
  // Données de surveillance
  tabSwitches: {
    type: Number,
    default: 0,
    min: 0
  },
  
  focusLostCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  copyPasteDetected: {
    type: Boolean,
    default: false
  },
  
  // Évaluation de l'enseignant
  teacherFeedback: {
    type: String,
    trim: true
  },
  
  manuallyGraded: {
    type: Boolean,
    default: false
  },
  
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  gradedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
reponseEtudiantSchema.index({ session: 1 });
reponseEtudiantSchema.index({ etudiant: 1 });
reponseEtudiantSchema.index({ question: 1 });
reponseEtudiantSchema.index({ session: 1, question: 1 });
reponseEtudiantSchema.index({ etudiant: 1, question: 1 });
reponseEtudiantSchema.index({ isCorrect: 1 });

const ReponseEtudiant = mongoose.model('ReponseEtudiant', reponseEtudiantSchema);

module.exports = ReponseEtudiant;
