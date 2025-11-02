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

// Upload item (auth temporarily removed for testing)
router.post('/upload', upload.single('image'), async (req, res) => {
  const { type, category, description, location } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    // Read the original image file as buffer
    const originalImageBuffer = await fs.readFile(req.file.path);
    
    // Process image with sharp for display
    const processedImageBuffer = await sharp(req.file.path)
      .resize(224, 224)
      .jpeg({ quality: 80 })
      .toBuffer();
    
    console.log('Image processed, generating embeddings locally...');
    
    // AI: Generate embeddings using local Python script
    // Try simple processor first (more stable), fallback to ViT if needed
    const embeddings = await new Promise((resolve, reject) => {
      const pythonScriptPath = path.join(__dirname, '..', 'ai_processor_simple.py');
      console.log('Using simple feature extractor:', pythonScriptPath);
      const pythonProcess = spawn('python', [pythonScriptPath, req.file.path]);
      
      let stdoutData = '';
      let stderrData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.log('Python:', data.toString().trim());
      });
      
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        console.log('Python stdout length:', stdoutData.length, 'bytes');
        
        // Check if we got any output
        if (!stdoutData || stdoutData.trim().length === 0) {
          console.error('❌ No output from Python script');
          console.error('Python stderr:', stderrData);
          reject(new Error(`Python script produced no output. Exit code: ${code}`));
          return;
        }
        
        // Try to parse the result
        try {
          const trimmedOutput = stdoutData.trim();
          console.log('Parsing JSON output (first 100 chars):', trimmedOutput.substring(0, 100));
          
          const result = JSON.parse(trimmedOutput);
          
          // Check if result contains an error
          if (result.error || !result.success) {
            console.error('❌ Python script returned error:', result.error);
            reject(new Error(`AI processing failed: ${result.error}`));
            return;
          }
          
          // Extract embeddings from result
          const embeddings = result.embeddings;
          
          // Validate embeddings
          if (!Array.isArray(embeddings) || embeddings.length === 0) {
            throw new Error('No embeddings generated');
          }
          
          if (typeof embeddings[0] !== 'number') {
            throw new Error(`Invalid embedding format - expected numbers, got ${typeof embeddings[0]}`);
          }
          
          console.log('✅ Embeddings generated:', embeddings.length, 'dimensions');
          console.log('Sample values:', embeddings.slice(0, 5).map(n => n.toFixed(4)));
          
          resolve(embeddings);
        } catch (parseErr) {
          console.error('❌ Failed to parse Python output:', parseErr.message);
          console.error('Raw stdout:', stdoutData);
          console.error('Python stderr:', stderrData);
          reject(new Error(`Failed to parse embeddings: ${parseErr.message}`));
        }
      });
      
      pythonProcess.on('error', (err) => {
        console.error('❌ Python process error:', err.message);
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });

    // Store item in MongoDB with binary image data
    const item = new Item({
      type,
      category,
      description,
      location,
      image: originalImageBuffer, // Store original image as binary
      imageType: req.file.mimetype, // Store MIME type (e.g., 'image/jpeg')
      userId: null, // Temporarily null for testing
      embeddings
    });
    
    await item.save();
    console.log('✅ Item saved to database:', item._id);
    console.log('   - Type:', type);
    console.log('   - Category:', category);
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

module.exports = router;