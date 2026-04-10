const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Schéma QuizSession
 * Suit les tentatives de quiz individuelles avec une gestion complète des sessions
 */
const quizSessionSchema = new mongoose.Schema({
  // Références
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  // Suivi de session
  sessionToken: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  duration: {
    type: Number,
    comment: 'Durée totale en secondes'
  },
  
  timeRemaining: {
    type: Number,
    comment: 'Temps restant en secondes'
  },
  
  pausedAt: {
    type: Date
  },
  
  resumedAt: {
    type: Date
  },
  
  totalPausedTime: {
    type: Number,
    default: 0,
    comment: 'Temps total en pause en secondes'
  },
  
  // Progression
  totalQuestions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currentQuestionIndex: {
    type: Number,
    default: 0,
    min: 0
  },
  
  questionsAnswered: {
    type: Number,
    default: 0,
    min: 0
  },
  
  questionsSkipped: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Score
  currentScore: {
    type: Number,
    default: 0,
    min: 0
  },
  
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  maxPossibleScore: {
    type: Number,
    default: 0,
    min: 0
  },
  
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  wrongAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Statut
  status: {
    type: String,
    enum: ['in_progress', 'paused', 'completed', 'submitted', 'abandoned', 'timed_out', 'terminated'],
    default: 'in_progress'
  },
  
  // Ordre des questions (pour quiz aléatoires)
  questionOrder: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  
  // Suivi des questions répondues
  answeredQuestions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answeredAt: Date,
    timeSpent: Number
  }],
  
  // Questions marquées
  flaggedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  
  // Données de surveillance
  proctoringData: {
    tabSwitches: { type: Number, default: 0 },
    focusLossCount: { type: Number, default: 0 },
    suspiciousActivities: [{
      type: { type: String },
      timestamp: Date,
      details: String
    }],
    browserInfo: {
      userAgent: String,
      screenResolution: String,
      fullscreenExits: { type: Number, default: 0 }
    }
  },
  
  // Informations IP et appareil
  ipAddress: {
    type: String
  },
  
  deviceInfo: {
    type: String
  },
  
  // Réussite/échec
  passed: {
    type: Boolean
  },
  
  // Informations de soumission
  submittedAt: {
    type: Date
  },
  
  autoSubmitted: {
    type: Boolean,
    default: false
  },
  
  submissionReason: {
    type: String,
    enum: ['manual', 'time_expired', 'tab_limit_exceeded', 'terminated_by_instructor', 'connection_lost']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
quizSessionSchema.index({ quiz: 1, etudiant: 1 });
quizSessionSchema.index({ etudiant: 1 });
quizSessionSchema.index({ status: 1 });
quizSessionSchema.index({ sessionToken: 1 }, { unique: true });
quizSessionSchema.index({ startTime: -1 });
quizSessionSchema.index({ quiz: 1, status: 1 });

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

module.exports = QuizSession;
