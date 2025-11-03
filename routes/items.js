const express = require('express');
const multer = require('multer');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs').promises;
const fsSync = require('fs'); // For synchronous file operations
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Cosine similarity function for vector comparison
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

// Upload item (with authentication)
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  const { type, category, description, location, dateFound, dateLost } = req.body;
  
  // Debug authentication
  console.log('🔑 Auth user:', req.user);
  console.log('   - Student ID:', req.user?.studentId);
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  
  if (!req.user || !req.user.studentId) {
    return res.status(401).json({ message: 'Authentication failed - missing student ID' });
  }

  try {
    // Read the original image file as buffer
    const originalImageBuffer = await fs.readFile(req.file.path);
    
    // Process image with sharp for display
    const processedImageBuffer = await sharp(req.file.path)
      .resize(224, 224)
      .jpeg({ quality: 80 })
      .toBuffer();
    
    console.log('Image processed, generating embeddings with AI...');
    
    // AI: Use enhanced processor (768 dimensions - ViT-like)
    console.log('🤖 Using Enhanced Computer Vision Processor (768D)...');
    const enhancedScriptPath = path.join(__dirname, '..', 'ai_processor_enhanced.py');
    
    const embeddings = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [enhancedScriptPath, req.file.path]);
      
      let stdoutData = '';
      let stderrData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        // Log Python stderr for debugging
        console.log(data.toString().trim());
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0 || !stdoutData || stdoutData.trim().length === 0) {
          reject(new Error(`Enhanced processor failed with code ${code}`));
          return;
        }
        
        try {
          const result = JSON.parse(stdoutData.trim());
          if (result.error || !result.success || !result.embeddings) {
            reject(new Error(`Enhanced processor returned error: ${result.error}`));
            return;
          }
          console.log(`✅ Enhanced processor success: ${result.embeddings.length} dimensions`);
          resolve(result.embeddings);
        } catch (err) {
          reject(new Error(`Enhanced processor parse error: ${err.message}`));
        }
      });
      
      pythonProcess.on('error', (err) => {
        reject(new Error(`Enhanced processor process error: ${err.message}`));
      });
    });

    // Store item in MongoDB with binary image data
    const item = new Item({
      type,
      category,
      description,
      location,
      dateReported: type === 'found' ? (dateFound || new Date()) : (dateLost || new Date()), // Use dateFound or dateLost based on type
      studentId: req.user.studentId, // Get studentId from authenticated user
      image: originalImageBuffer, // Store original image as binary
      imageType: req.file.mimetype, // Store MIME type (e.g., 'image/jpeg')
      embeddings
    });
    
    await item.save();
    console.log('✅ Item saved to database:', item._id);
    console.log('   - Type:', type);
    console.log('   - Category:', category);
    console.log('   - Date Reported:', item.dateReported);
    console.log('   - Student ID:', req.user.studentId);
    console.log('   - Image size:', originalImageBuffer.length, 'bytes');
    console.log('   - Embeddings dimensions:', embeddings.length);
    
    // Clean up temporary file
    try {
      await fs.unlink(req.file.path);
      console.log('✅ Temporary file cleaned up');
    } catch (cleanupErr) {
      console.warn('⚠️ Could not delete temp file:', cleanupErr.message);
    }
    
    res.status(201).json({ 
      message: 'Item uploaded successfully', 
      itemId: item._id,
      embeddings: embeddings.length 
    });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    console.error('Full error:', err);
    
    // Clean up temp file on error
    try {
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path);
      }
    } catch (cleanupErr) {
      // Ignore cleanup errors
    }
    
    res.status(500).json({ message: 'Error uploading item: ' + err.message });
  }
});

// Search/Match items with similarity scoring (auth temporarily removed for testing)
router.get('/search', async (req, res) => {
  try {
    const lostItems = await Item.find({ type: 'lost', claimed: false });
    const foundItems = await Item.find({ type: 'found', claimed: false });
    
    console.log(`Found ${lostItems.length} lost items and ${foundItems.length} found items (unclaimed only)`);
    
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
              location: lostItem.location
            },
            found: {
              id: foundItem._id,
              category: foundItem.category,
              description: foundItem.description,
              location: foundItem.location
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

// Get image by ID - serves image from MongoDB
router.get('/image/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.image) {
      return res.status(404).send('Image not found');
    }
    
    res.set('Content-Type', item.imageType);
    res.send(item.image);
  } catch (err) {
    console.error('Error retrieving image:', err);
    res.status(500).send('Error retrieving image');
  }
});

// Delete item by ID (auth temporarily removed for testing)
router.delete('/delete/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('✅ Item deleted:', req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Error deleting item: ' + err.message });
  }
});

// Mark item as claimed (auth temporarily removed for testing)
router.put('/claim/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id, 
      { claimed: true }, 
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('✅ Item claimed:', req.params.id);
    res.json({ message: 'Item marked as claimed successfully', item });
  } catch (err) {
    console.error('❌ Claim error:', err);
    res.status(500).json({ message: 'Error claiming item: ' + err.message });
  }
});

// Admin: Get all items (including claimed ones)
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find({}).sort({ createdAt: -1 });
    console.log(`✅ Retrieved ${items.length} items for admin`);
    res.json(items);
  } catch (err) {
    console.error('❌ Error fetching all items:', err);
    res.status(500).json({ message: 'Error fetching items: ' + err.message });
  }
});

// Admin: Update item details
router.put('/update/:id', async (req, res) => {
  try {
    const { category, location, description, type } = req.body;
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        category, 
        location, 
        description, 
        type 
      },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('✅ Item updated:', req.params.id);
    res.json({ message: 'Item updated successfully', item });
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ message: 'Error updating item: ' + err.message });
  }
});

module.exports = router;