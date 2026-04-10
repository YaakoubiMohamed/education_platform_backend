const mongoose = require('mongoose');

/**
 * Schéma FormationEnrollment
 * Suit les inscriptions des étudiants aux formations avec progression et statut
 */
const formationEnrollmentSchema = new mongoose.Schema({
  // Références
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    required: true
  },
  
  // Suivi de progression
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Statut d'inscription
  status: {
    type: String,
    enum: ['enrolled', 'in_progress', 'completed', 'dropped', 'suspended'],
    default: 'enrolled'
  },
  
  // Suivi des dates
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  
  startDate: {
    type: Date
  },
  
  completionDate: {
    type: Date
  },
  
  expectedCompletionDate: {
    type: Date
  },
  
  // Performance académique
  finalGrade: {
    type: Number,
    min: 0,
    max: 100
  },
  
  averageQuizScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Temps total passé en minutes'
  },
  
  // Suivi de complétion
  coursesCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalCourses: {
    type: Number,
    default: 0,
    min: 0
  },
  
  quizzesCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalQuizzes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Administratif
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  // Certificat
  certificateIssued: {
    type: Boolean,
    default: false
  },
  
  certificateDate: {
    type: Date
  },
  
  certificateUrl: {
    type: String,
    maxlength: 500
  },
  
  // Paiement (si applicable)
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'free'],
    default: 'free'
  },
  
  paymentAmount: {
    type: Number,
    min: 0
  },
  
  paymentDate: {
    type: Date
  },
  
  // Dernière activité
  lastAccessDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composé pour inscription unique
formationEnrollmentSchema.index({ etudiant: 1, formation: 1 }, { unique: true });
formationEnrollmentSchema.index({ etudiant: 1 });
formationEnrollmentSchema.index({ formation: 1 });
formationEnrollmentSchema.index({ status: 1 });
formationEnrollmentSchema.index({ enrollmentDate: -1 });
formationEnrollmentSchema.index({ completionDate: -1 });

const FormationEnrollment = mongoose.model('FormationEnrollment', formationEnrollmentSchema);

module.exports = FormationEnrollment;
