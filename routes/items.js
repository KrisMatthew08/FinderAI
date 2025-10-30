const express = require('express');
const multer = require('multer');
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Store images in 'uploads' folder

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Upload item
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  const { type, category, description, location } = req.body;
  const imagePath = req.file.path;

  try {
    // AI: Extract features using Hugging Face (simplified)
    const response = await axios.post('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', 
      { inputs: imagePath }, // You'd need to send image data properly
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );
    const embeddings = response.data; // Store feature vector

    const item = new Item({ type, category, description, location, imagePath, userId: req.user.id, embeddings });
    await item.save();
    res.status(201).send('Item uploaded');
  } catch (err) {
    res.status(500).send('Error uploading item');
  }
});

// Search/Match items (basic similarity check)
router.get('/search', auth, async (req, res) => {
  try {
    const items = await Item.find({ type: 'found' }); // Example: match lost with found
    // Implement FAISS or cosine similarity here for real matching
    res.json(items);
  } catch (err) {
    res.status(500).send('Error searching items');
  }
});

module.exports = router;