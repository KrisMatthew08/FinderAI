require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const imghash = require('imghash'); // phash
const sharp = require('sharp');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finderai';
const port = process.env.PORT || 5000;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('MongoDB connected and GridFS initialized');
});

// Mongoose schema for items
const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: String,
  description: String,
  category: String,
  location: String,
  reportedAt: { type: Date, default: Date.now },
  uploader: String,
  fileId: mongoose.Schema.Types.ObjectId, // GridFS file id
  phash: String, // perceptual hash
  // placeholder for vector embeddings
  embedding: { type: [Number], default: [] },
  feedback: [{ user: String, confirmed: Boolean, at: Date }]
});
const Item = mongoose.model('Item', itemSchema);

// Ensure temp_uploads directory exists
const tempDir = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Use multer to store uploads temporarily to compute pHash
const upload = multer({ dest: tempDir });

// Upload endpoint (lost or found)
app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const { type, title, description, category, location, uploader } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image required' });

    // Preprocess image (resize) with sharp for consistent hashing
    const tempPath = req.file.path;
    const processedPath = `${tempPath}-proc.jpg`;
    await sharp(tempPath)
      .resize(800, 800, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(processedPath);

    // compute pHash
    const phash = await imghash.hash(processedPath, 16, 'hex'); // 16 => 64-bit
    // store file in GridFS
    const writeStream = gfs.createWriteStream({
      filename: req.file.originalname,
      content_type: req.file.mimetype
    });
    fs.createReadStream(processedPath).pipe(writeStream);
    writeStream.on('close', async (file) => {
      // create item entry
      const newItem = new Item({
        type,
        title,
        description,
        category,
        location,
        uploader,
        fileId: file._id,
        phash
      });
      await newItem.save();

      // remove temp files
      fs.unlink(tempPath, () => {});
      fs.unlink(processedPath, () => {});

      res.json({ success: true, item: newItem });
    });

    writeStream.on('error', (err) => {
      console.error('GridFS write error', err);
      res.status(500).json({ error: 'Failed to save file' });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper: compute Hamming distance between hex phashes
function hexToBinaryString(hexStr) {
  return hexStr.split('').map(h => parseInt(h, 16).toString(2).padStart(4,'0')).join('');
}
function hammingDistance(hexA, hexB) {
  const a = hexToBinaryString(hexA);
  const b = hexToBinaryString(hexB);
  let dist = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) dist++;
  // if lengths differ (shouldn't), count extra bits
  dist += Math.abs(a.length - b.length);
  return dist;
}

// Search matches: given an item id (lost) find best found matches (or vice versa)
// Query params: id, maxResults (default 10), maxHammingThreshold optional
app.get('/api/search/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const maxResults = parseInt(req.query.maxResults) || 10;
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : 18; // lower is stricter

    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const oppositeType = (item.type === 'lost') ? 'found' : 'lost';
    // fetch candidates of opposite type with same category optionally
    const candidates = await Item.find({ type: oppositeType }).limit(500).exec(); // limit for speed

    const scored = candidates.map(c => {
      const dist = hammingDistance(item.phash, c.phash);
      // similarity score (0..1) inverse of normalized distance
      // pHash length 64 bits => max distance 64
      const score = 1 - (dist / 64);
      return { candidate: c, distance: dist, score };
    });

    // filter by threshold, sort by score desc
    const filtered = scored
      .filter(s => s.distance <= threshold)
      .sort((a,b) => b.score - a.score)
      .slice(0, maxResults);

    res.json({ base: item, matches: filtered });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to stream image from GridFS by fileId
app.get('/api/image/:fileId', (req, res) => {
  const { fileId } = req.params;
  try {
    const _id = mongoose.Types.ObjectId(fileId);
    gfs.files.findOne({ _id }, (err, file) => {
      if (!file || file.length === 0) return res.status(404).json({ error: 'No file found' });
      const readstream = gfs.createReadStream({ _id: file._id });
      res.set('Content-Type', file.contentType);
      readstream.pipe(res);
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid file id' });
  }
});

// Feedback endpoint (confirm match or reject)
app.post('/api/feedback', async (req, res) => {
  try {
    const { baseItemId, matchItemId, user, confirmed } = req.body;
    if (!baseItemId || !matchItemId) return res.status(400).json({ error: 'missing ids' });

    const base = await Item.findById(baseItemId);
    if (!base) return res.status(404).json({ error: 'base item not found' });

    base.feedback.push({ user: user || 'anonymous', confirmed: !!confirmed, at: new Date() });
    await base.save();

    // Optionally track on match item too
    const match = await Item.findById(matchItemId);
    if (match) {
      match.feedback.push({ user: user || 'anonymous', confirmed: !!confirmed, at: new Date() });
      await match.save();
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`FinderAI backend running on port ${port}`);
});
