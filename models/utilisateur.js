const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schéma Utilisateur
 * Représente les utilisateurs (étudiants, enseignants, administrateurs) de la plateforme éducative
 */
const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, 'Le nom ne peut contenir que des lettres']
  },
  
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide']
  },
  
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false
  },
  
  etat: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'blocked'],
    default: 'pending'
  },
  
  role: {
    type: String,
    enum: ['etudiant', 'enseignant', 'admin'],
    default: 'etudiant'
  },
  
  // Champs de sécurité
  derniereConnexion: {
    type: Date,
    default: null
  },
  
  motDePasseModifieLe: {
    type: Date,
    default: Date.now
  },
  
  tentativesConnexionEchouees: {
    type: Number,
    default: 0
  },
  
  compteVerrouilleJusqu: {
    type: Date,
    default: null
  },
  
  emailVerifie: {
    type: Boolean,
    default: false
  },
  
  tokenVerificationEmail: {
    type: String,
    select: false
  },
  
  tokenResetMotDePasse: {
    type: String,
    select: false
  },
  
  tokenResetExpireLe: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
utilisateurSchema.index({ role: 1 });
utilisateurSchema.index({ etat: 1 });
utilisateurSchema.index({ derniereConnexion: -1 });

const Utilisateur = mongoose.models.Utilisateur || mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;
