const mongoose = require('mongoose');

/**
 * Schéma Performance
 * Suit les performances des étudiants aux quiz/tests et analyses
 */
const performanceSchema = new mongoose.Schema({
  // Références
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSession'
  },
  
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation'
  },
  
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours'
  },
  
  // Notation
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  pointsPossible: {
    type: Number,
    default: 0,
    min: 0
  },
  
  grade: {
    type: String,
    maxlength: 5
  },
  
  // Statistiques des questions
  totalQuestions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  incorrectAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  skippedQuestions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  partiallyCorrect: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timing
  datePassage: {
    type: Date,
    default: Date.now
  },
  
  timeSpent: {
    type: Number,
    min: 0,
    comment: 'Temps passé en secondes'
  },
  
  averageTimePerQuestion: {
    type: Number,
    min: 0
  },
  
  // Suivi des tentatives
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  
  isLatestAttempt: {
    type: Boolean,
    default: true
  },
  
  isBestAttempt: {
    type: Boolean,
    default: true
  },
  
  // Réussite/Échec
  passed: {
    type: Boolean
  },
  
  passingScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Feedback
  feedback: {
    type: String,
    trim: true
  },
  
  feedbackBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  feedbackDate: {
    type: Date
  },
  
  // Résultats détaillés
  questionResults: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    isCorrect: Boolean,
    pointsEarned: Number,
    timeSpent: Number,
    selectedChoices: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Choix'
    }],
    textAnswer: String
  }],
  
  // Performance par catégorie
  categoryPerformance: [{
    category: String,
    correctCount: Number,
    totalCount: Number,
    percentage: Number
  }],
  
  // Suivi de l'amélioration
  improvementFromPrevious: {
    type: Number,
    comment: 'Pourcentage d\'amélioration par rapport à la tentative précédente'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
performanceSchema.index({ etudiant: 1, quiz: 1 });
performanceSchema.index({ etudiant: 1 });
performanceSchema.index({ quiz: 1 });
performanceSchema.index({ formation: 1 });
performanceSchema.index({ cours: 1 });
performanceSchema.index({ session: 1 });
performanceSchema.index({ datePassage: -1 });
performanceSchema.index({ score: -1 });
performanceSchema.index({ etudiant: 1, quiz: 1, attemptNumber: 1 });

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
