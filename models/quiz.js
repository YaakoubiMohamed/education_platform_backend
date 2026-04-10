const mongoose = require('mongoose');

/**
 * Schéma Quiz
 * Représente les quiz avec des options de configuration complètes
 */
const quizSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: 255
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Références
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours'
  },
  
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  // Configuration du temps
  timeLimit: {
    type: Number,
    min: 0,
    comment: 'Limite de temps en minutes'
  },
  
  showTimer: {
    type: Boolean,
    default: true
  },
  
  timerWarningMinutes: {
    type: Number,
    default: 5
  },
  
  // Configuration des tentatives
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  
  allowRetakeAfterCompletion: {
    type: Boolean,
    default: false
  },
  
  cooldownPeriod: {
    type: Number,
    comment: 'Heures entre les tentatives'
  },
  
  // Configuration des questions
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  
  randomizeChoices: {
    type: Boolean,
    default: false
  },
  
  questionsPerAttempt: {
    type: Number,
    min: 1
  },
  
  // Navigation
  allowBackNavigation: {
    type: Boolean,
    default: true
  },
  
  allowQuestionSkipping: {
    type: Boolean,
    default: true
  },
  
  // Révision et feedback
  allowReview: {
    type: Boolean,
    default: true
  },
  
  showCorrectAnswers: {
    type: Boolean,
    default: false
  },
  
  showScoreImmediately: {
    type: Boolean,
    default: true
  },
  
  provideFeedback: {
    type: Boolean,
    default: false
  },
  
  // Sécurité
  enableProctoring: {
    type: Boolean,
    default: false
  },
  
  enableFullscreen: {
    type: Boolean,
    default: false
  },
  
  disableRightClick: {
    type: Boolean,
    default: false
  },
  
  preventCopyPaste: {
    type: Boolean,
    default: false
  },
  
  tabSwitchLimit: {
    type: Number,
    default: 3
  },
  
  // Notation
  passingScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  enablePartialCredit: {
    type: Boolean,
    default: false
  },
  
  negativeMarking: {
    type: Boolean,
    default: false
  },
  
  negativeMarkingPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 25
  },
  
  // Disponibilité
  startDate: {
    type: Date
  },
  
  endDate: {
    type: Date
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Statistiques
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  passRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Instructions
  instructions: {
    type: String,
    trim: true
  },
  
  completionMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
quizSchema.index({ cours: 1 });
quizSchema.index({ enseignant: 1 });
quizSchema.index({ isActive: 1, isPublished: 1 });
quizSchema.index({ startDate: 1, endDate: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
