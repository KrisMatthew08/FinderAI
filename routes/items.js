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
    
    console.log('Image processed, sending to Hugging Face API...');
    
    // AI: Extract features using Hugging Face - using sentence-transformers for embeddings
    // Note: sentence-transformers/clip-ViT-B-32 is specifically designed for image embeddings
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/sentence-transformers/clip-ViT-B-32',
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    
    console.log('API response status:', response.status);
    console.log('API response type:', typeof response.data);
    console.log('API response structure:', JSON.stringify(response.data).substring(0, 300));
    
    // Extract embeddings from response
    let embeddings = [];
    
    if (Array.isArray(response.data)) {
      // If it's a nested array, flatten it
      embeddings = Array.isArray(response.data[0]) ? response.data[0] : response.data;
    } else if (response.data.embeddings) {
      // Some models return { embeddings: [...] }
      embeddings = response.data.embeddings;
    } else if (typeof response.data === 'object') {
      // Try to extract array from object
      const values = Object.values(response.data);
      embeddings = Array.isArray(values[0]) ? values[0] : values;
    }
    
    // Validate embeddings are numbers
    if (!Array.isArray(embeddings) || embeddings.length === 0) {
      throw new Error(`No embeddings extracted. Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
    
    if (typeof embeddings[0] !== 'number') {
      throw new Error(`Invalid embedding format - expected numbers, got ${typeof embeddings[0]}. Sample: ${JSON.stringify(embeddings.slice(0, 3))}`);
    }
    
    console.log('✅ Embeddings received:', embeddings.length, 'dimensions');
    console.log('Sample values:', embeddings.slice(0, 5).map(n => n.toFixed(4)));

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
    console.log('✅ Item saved to database:', item._id);
    res.status(201).json({ message: 'Item uploaded successfully', itemId: item._id });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    
    // Log API-specific errors
    if (err.response) {
      console.error('API Error Status:', err.response.status);
      console.error('API Error Data:', err.response.data);
      return res.status(500).json({ 
        message: `Hugging Face API error (${err.response.status}): ${JSON.stringify(err.response.data)}` 
      });
    }
    
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