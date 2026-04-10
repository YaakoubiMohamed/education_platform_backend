const mongoose = require('mongoose');

/**
 * Index des Modèles
 * Point d'exportation central pour tous les modèles avec les références appropriées
 */

// Importation de tous les modèles
const Utilisateur = require('./utilisateur');
const Cours = require('./cours');
const Formation = require('./formation');
const Categorie = require('./categorie');
const Publication = require('./publication');
const Commentaire = require('./commentaire');
const Message = require('./message');
const Quiz = require('./quiz');
const Question = require('./question');
const Choix = require('./choix');
const Groupe = require('./groupe');
const Progression = require('./progression');
const Performance = require('./performance');
const ReponseEtudiant = require('./reponseEtudiant');
const FormationEnrollment = require('./formationEnrollment');
const QuizSession = require('./quizSession');

/**
 * Note: Dans Mongoose, les relations sont définies dans les schémas en utilisant des références ObjectId.
 * La population est utilisée pour résoudre ces références lors des requêtes.
 * 
 * Relations principales:
 * 
 * Utilisateur:
 *   - Possède plusieurs Cours (en tant qu'enseignant)
 *   - Possède plusieurs Publications (en tant qu'auteur)
 *   - Possède plusieurs Commentaires (en tant qu'auteur)
 *   - Possède plusieurs Messages (en tant qu'expéditeur/destinataire)
 *   - Possède plusieurs Formations (en tant qu'enseignant)
 *   - Possède plusieurs Groupes (en tant que créateur/modérateur)
 *   - Appartient à plusieurs Formations via FormationEnrollment
 * 
 * Formation:
 *   - Appartient à Categorie
 *   - Appartient à Utilisateur (enseignant)
 *   - Possède plusieurs Cours
 *   - Possède plusieurs Groupes
 *   - Possède plusieurs Publications
 *   - Appartient à plusieurs Utilisateurs via FormationEnrollment
 * 
 * Cours:
 *   - Appartient à Formation
 *   - Appartient à Utilisateur (enseignant)
 *   - Possède plusieurs Quiz
 *   - Possède plusieurs Progressions
 * 
 * Quiz:
 *   - Appartient à Cours
 *   - Appartient à Utilisateur (enseignant)
 *   - Possède plusieurs Questions
 *   - Possède plusieurs QuizSessions
 *   - Possède plusieurs Performances
 * 
 * Question:
 *   - Appartient à Quiz
 *   - Possède plusieurs Choix
 *   - Possède plusieurs ReponseEtudiant
 * 
 * Publication:
 *   - Appartient à Utilisateur (auteur)
 *   - Appartient à Groupe (optionnel)
 *   - Appartient à Formation (optionnel)
 *   - Possède plusieurs Commentaires
 * 
 * Commentaire:
 *   - Appartient à Utilisateur (auteur)
 *   - Appartient à Publication
 *   - Appartient à Commentaire (parent, pour les réponses imbriquées)
 * 
 * QuizSession:
 *   - Appartient à Quiz
 *   - Appartient à Utilisateur (étudiant)
 *   - Possède plusieurs ReponseEtudiant
 *   - Possède une Performance
 */

// Exportation de tous les modèles
module.exports = {
  // Modèle utilisateur principal
  Utilisateur,
  
  // Modèles cours/formation
  Cours,
  Formation,
  Categorie,
  FormationEnrollment,
  
  // Modèles social/communauté
  Publication,
  Commentaire,
  Message,
  Groupe,
  
  // Modèles quiz/évaluation
  Quiz,
  Question,
  Choix,
  QuizSession,
  ReponseEtudiant,
  
  // Suivi de progression/performance
  Progression,
  Performance,
  
  // Instance Mongoose pour accès direct si nécessaire
  mongoose
};
