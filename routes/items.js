const express = require('express');
const multer = require('multer');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Store images in 'uploads' folder

// Cosine similarity function for vector comparison
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// Upload item
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  const { type, category, description, location } = req.body;
  const imagePath = req.file.path;

  try {
    // Process image with sharp
    const processedImagePath = `${imagePath}_processed.jpg`;
    await sharp(imagePath)
      .resize(224, 224) // Resize to ViT input size
      .jpeg({ quality: 80 })
      .toFile(processedImagePath);
    
    // Read image as base64 for Hugging Face API
    const imageBuffer = await fs.readFile(processedImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // AI: Extract features using Hugging Face
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    
    const embeddings = Array.isArray(response.data) ? response.data : [];

    const item = new Item({
      type,
      category,
      description,
      location,
      imagePath: processedImagePath,
      userId: req.user.id,
      embeddings
    });
    
    await item.save();
    res.status(201).send('Item uploaded successfully');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Error uploading item: ' + err.message);
  }
});

// Search/Match items with similarity scoring
router.get('/search', auth, async (req, res) => {
  try {
    const userItems = await Item.find({ userId: req.user.id, type: 'lost' });
    const allFoundItems = await Item.find({ type: 'found' });
    
    if (userItems.length === 0) {
      return res.json([]);
    }
    
    const matches = [];
    
    for (const lostItem of userItems) {
      if (!lostItem.embeddings || lostItem.embeddings.length === 0) continue;
      
      for (const foundItem of allFoundItems) {
        if (!foundItem.embeddings || foundItem.embeddings.length === 0) continue;
        
        const similarity = cosineSimilarity(lostItem.embeddings, foundItem.embeddings);
        
        if (similarity > 0.7) { // Threshold for matches
          matches.push({
            ...foundItem.toObject(),
            similarity: similarity.toFixed(3),
            matchedWith: lostItem.category
          });
        }
      }
    }
    
    // Sort by similarity score
    matches.sort((a, b) => b.similarity - a.similarity);
    
    res.json(matches);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Error searching items: ' + err.message);
  }
});

module.exports = router;