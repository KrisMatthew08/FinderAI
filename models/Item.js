const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'lost' or 'found'
  category: { type: String, required: true }, // e.g., 'bag', 'ID'
  description: String,
  location: String,
  date: { type: Date, default: Date.now },
  imagePath: String, // Path to uploaded image
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  embeddings: [Number], // AI feature vector for matching
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }] // Potential matches
});

module.exports = mongoose.model('Item', itemSchema);