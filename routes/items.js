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

// Upload item (auth temporarily removed for testing)
router.post('/upload', upload.single('image'), async (req, res) => {
  const { type, category, description, location } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    // Process image with sharp - resize to ViT input size
    const imageBuffer = await sharp(req.file.path)
      .resize(224, 224)
      .jpeg({ quality: 80 })
      .toBuffer();
    
    console.log('Image processed, sending to Hugging Face CLIP API...');
    
    // AI: Extract features using Hugging Face CLIP model (designed for embeddings)
    const response = await axios.post(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/openai/clip-vit-base-patch32',
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    
    console.log('API response type:', typeof response.data);
    console.log('API response sample:', JSON.stringify(response.data).substring(0, 200));
    
    // Extract embeddings from response - CLIP returns array directly
    let embeddings = [];
    if (Array.isArray(response.data)) {
      // CLIP returns embeddings directly as an array or nested array
      embeddings = Array.isArray(response.data[0]) ? response.data[0] : response.data;
    }
    
    // Validate embeddings are numbers
    if (embeddings.length === 0 || typeof embeddings[0] !== 'number') {
      throw new Error(`Invalid embeddings format. Got: ${JSON.stringify(response.data).substring(0, 100)}`);
    }
    
    console.log('Embeddings received:', embeddings.length, 'dimensions');
    console.log('First 5 values:', embeddings.slice(0, 5));

    const item = new Item({
      type,
      category,
      description,
      location,
      imagePath: req.file.path,
      userId: null, // Temporarily null for testing
      embeddings
    });
    
    await item.save();
    console.log('Item saved to database:', item._id);
    res.status(201).json({ message: 'Item uploaded successfully', itemId: item._id });
  } catch (err) {
    console.error('Upload error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ message: 'Error uploading item: ' + err.message });
  }
});

// Search/Match items with similarity scoring (auth temporarily removed for testing)
router.get('/search', async (req, res) => {
  try {
    const lostItems = await Item.find({ type: 'lost' });
    const foundItems = await Item.find({ type: 'found' });
    
    console.log(`Found ${lostItems.length} lost items and ${foundItems.length} found items`);
    
    if (lostItems.length === 0 || foundItems.length === 0) {
      return res.json([]);
    }
    
    const matches = [];
    
    for (const lostItem of lostItems) {
      if (!lostItem.embeddings || lostItem.embeddings.length === 0) {
        console.log('Lost item missing embeddings:', lostItem._id);
        continue;
      }
      
      for (const foundItem of foundItems) {
        if (!foundItem.embeddings || foundItem.embeddings.length === 0) {
          console.log('Found item missing embeddings:', foundItem._id);
          continue;
        }
        
        const similarity = cosineSimilarity(lostItem.embeddings, foundItem.embeddings);
        console.log(`Similarity between ${lostItem.category} and ${foundItem.category}: ${similarity.toFixed(3)}`);
        
        if (similarity > 0.5) { // Lowered threshold for testing
          matches.push({
            lost: {
              id: lostItem._id,
              category: lostItem.category,
              description: lostItem.description,
              location: lostItem.location,
              imagePath: lostItem.imagePath
            },
            found: {
              id: foundItem._id,
              category: foundItem.category,
              description: foundItem.description,
              location: foundItem.location,
              imagePath: foundItem.imagePath
            },
            score: parseFloat(similarity.toFixed(3))
          });
        }
      }
    }
    
    // Sort by similarity score
    matches.sort((a, b) => b.score - a.score);
    
    console.log(`Returning ${matches.length} matches`);
    res.json(matches);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Error searching items: ' + err.message });
  }
});

module.exports = router;