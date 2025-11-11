const mongoose = require('mongoose');

const dismissedMatchSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  yourItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item'
  },
  dismissedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item'
  },
  dismissedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness
dismissedMatchSchema.index({ studentId: 1, yourItemId: 1, dismissedItemId: 1 }, { unique: true });

module.exports = mongoose.model('DismissedMatch', dismissedMatchSchema);
