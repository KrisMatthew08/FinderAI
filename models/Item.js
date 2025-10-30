const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'lost' or 'found'
  category: { type: String, required: true }, // e.g., 'bag', 'ID'
  description: String,
  location: String,
  date: { type: Date, default: Date.now },
  image: { type: Buffer, required: true }, // Store image as binary data
  imageType: { type: String, required: true }, // MIME type (e.g., 'image/jpeg')
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  embeddings: {
    type: [Number],
    validate: {
      validator: function(v) {
        return v && v.length > 0 && v.every(num => typeof num === 'number');
      },
      message: 'Embeddings must be an array of numbers'
    }
  }, // AI feature vector for matching
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }] // Potential matches
});

module.exports = mongoose.model('Item', itemSchema);