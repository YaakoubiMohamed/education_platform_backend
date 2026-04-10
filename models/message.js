const mongoose = require('mongoose');

/**
 * Schéma Message
 * Représente les messages directs entre utilisateurs
 */
const messageSchema = new mongoose.Schema({
  // Références
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  conversationId: {
    type: String,
    index: true
  },
  
  // Contenu
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true
  },
  
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'system'],
    default: 'text'
  },
  
  // Pièces jointes
  attachmentUrl: {
    type: String,
    maxlength: 500
  },
  
  attachmentName: {
    type: String,
    maxlength: 255
  },
  
  attachmentSize: {
    type: Number,
    min: 0
  },
  
  attachmentType: {
    type: String,
    maxlength: 100
  },
  
  // Statut de lecture
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  isDelivered: {
    type: Boolean,
    default: false
  },
  
  deliveredAt: {
    type: Date
  },
  
  // Suppression
  isDeletedBySender: {
    type: Boolean,
    default: false
  },
  
  isDeletedByRecipient: {
    type: Boolean,
    default: false
  },
  
  deletedForEveryone: {
    type: Boolean,
    default: false
  },
  
  // Modification
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  originalContent: {
    type: String
  },
  
  // Fil de réponse
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
messageSchema.index({ expediteur: 1 });
messageSchema.index({ destinataire: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ expediteur: 1, destinataire: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
