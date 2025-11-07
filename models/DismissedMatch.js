const mongoose = require('mongoose');

const dismissedMatchSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  yourItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  dismissedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index to ensure uniqueness
dismissedMatchSchema.index({ studentId: 1, yourItemId: 1, dismissedItemId: 1 }, { unique: true });

module.exports = mongoose.model('DismissedMatch', dismissedMatchSchema);
