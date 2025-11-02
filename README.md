# FinderAI - AI-Powered Lost & Found System

FinderAI is an intelligent lost-and-found platform that uses AI-powered image recognition to help people find their lost items. The system matches lost items with found items using Vision Transformer (ViT) models for image similarity.

## Features

- 🔐 **User Authentication**: Secure signup and login with JWT tokens
- 📸 **Image Upload**: Upload images of lost or found items
- 🤖 **AI Matching**: Uses Hugging Face's Vision Transformer (ViT) for image feature extraction
- 🔍 **Smart Search**: Cosine similarity-based matching to find similar items
- 🛡️ **Privacy-First**: Built with data privacy in mind, warnings against uploading personal information
- 📱 **Responsive Design**: Clean, user-friendly interface

## Tech Stack

### Backend
- **Node.js** & **Express**: Server framework
- **MongoDB** & **Mongoose**: Database
- **Multer**: File upload handling
- **Sharp**: Image processing and optimization
- **JWT**: Authentication
- **Axios**: HTTP requests to Hugging Face API

### Frontend
- **HTML/CSS/JavaScript**: Simple, responsive UI
- **Fetch API**: Communication with backend

### AI/ML
- **Python**: Local AI processing with Vision Transformer models
- **PyTorch & Transformers**: Deep learning framework for image embeddings
- **PIL & NumPy**: Lightweight feature extraction (color histograms, edge detection)
- **Cosine Similarity**: Vector comparison for matching

## Setup Instructions

### Prerequisites

Before cloning the repository, make sure you have these installed on your system:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.8 to 3.11) - [Download here](https://www.python.org/)
   - ⚠️ **Important**: Use Python 3.11 or lower (Python 3.12+ may have compatibility issues with PyTorch)
3. **MongoDB** - Choose one:
   - **MongoDB Atlas** (Cloud - Recommended for beginners): [Sign up free](https://www.mongodb.com/cloud/atlas)
   - **MongoDB Local**: [Download Community Edition](https://www.mongodb.com/try/download/community)
4. **Git** - [Download here](https://git-scm.com/)

### Installation Steps

#### Step 1: Clone the Repository

```bash
git clone https://github.com/KrisMatthew08/FinderAI.git
cd FinderAI
```

#### Step 2: Install Node.js Dependencies

```bash
npm install
```

This installs all required Node.js packages:
- express, mongoose, multer, sharp, bcryptjs, jsonwebtoken, dotenv, cors, axios

#### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- transformers (Hugging Face models)
- torch (PyTorch for deep learning)
- pillow (Image processing)
- numpy (Numerical computations)

**If pip install fails**, try:
```bash
python -m pip install -r requirements.txt
```

**For Windows users**, if you get torch installation errors:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install transformers pillow numpy
```

#### Step 4: Create `.env` File

1. **Copy the example file**:
#### Step 4: Create `.env` File

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```
   
   **On Windows (PowerShell)**:
   ```powershell
   Copy-Item .env.example .env
   ```

2. **Edit the `.env` file** with your actual credentials:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   PORT=3000
   DB_NAME=FinderAI
   ```

3. **Get MongoDB Connection String**:
   
   **Option A: MongoDB Atlas (Cloud - Recommended)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a new cluster (free tier available)
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `FinderAI`
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/FinderAI?retryWrites=true&w=majority`
   
   **Option B: MongoDB Local**
   - Install MongoDB Community Edition
   - Connection string: `mongodb://localhost:27017/FinderAI`

4. **Generate JWT Secret**:
   ```bash
   node -p "require('crypto').randomBytes(64).toString('hex')"
   ```
   Copy the output and paste it as `JWT_SECRET` in your `.env` file

   ⚠️ **CRITICAL SECURITY WARNINGS:**
   - **NEVER commit the `.env` file to GitHub!** It's already in `.gitignore`
   - **NEVER share your `.env` file** or its contents publicly
   - If you accidentally expose credentials:
     1. Immediately change your MongoDB password
     2. Generate a new JWT secret
     3. Remove the commit from Git history or rotate all credentials

#### Step 5: Verify Python Installation

Test if Python is correctly set up:

```bash
python --version
```

Should show Python 3.8-3.11. If it shows Python 2.x or command not found:
- Windows: Use `py --version` or add Python to PATH
- Mac/Linux: Use `python3 --version`

Test the AI processor:
```bash
python test_python.py
```

Should print the Python version without errors.

#### Step 6: Start the Application

1. **Make sure MongoDB is running**:
   - Atlas: Already running (cloud-based)
   - Local: Run `mongod` in a terminal

2. **Start the Node.js server**:
   ```bash
   npm start
   ```
   
   Or:
   ```bash
   node server.js
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:3000`
   - You should see the FinderAI interface

4. **Verify everything works**:
   - Upload a test image (lost item)
   - Upload another similar image (found item)
   - Click "Search for Matches"
   - You should see matches with similarity scores

---

## Working with GitHub

### This Repository is Already on GitHub!

The FinderAI project is already hosted at: **https://github.com/KrisMatthew08/FinderAI**

### Making Changes and Updating GitHub

When you make changes to the code:

1. **Check what files changed**:
   ```bash
   git status
   ```

2. **Stage your changes**:
   ```bash
   git add .
   ```
   
   Or add specific files:
   ```bash
   git add filename.js
   ```

3. **Commit your changes**:
   ```bash
   git commit -m "Brief description of what you changed"
   ```

4. **Push to GitHub**:
   ```bash
   git push origin main
   ```

### Important: What NOT to Push

The following are automatically ignored (in `.gitignore`):
- ✅ `.env` (contains secrets - NEVER push this!)
- ✅ `node_modules/` (too large, reinstalled with npm install)
- ✅ `uploads/` (user uploaded images)
- ✅ `__pycache__/` (Python cache files)

**Always include**:
- ✅ `.env.example` (template without real credentials)
- ✅ `package.json` (lists dependencies)
- ✅ `requirements.txt` (Python dependencies)
- ✅ All source code files (.js, .py, .html, .css)
- ✅ README.md

### For Others to Clone This Repository

Anyone can clone and run FinderAI with these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KrisMatthew08/FinderAI.git
   cd FinderAI
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** (copy from example):
   ```bash
   cp .env.example .env
   ```
   
   **Windows (PowerShell)**:
   ```powershell
   Copy-Item .env.example .env
   ```
   
   Then edit `.env` with their own:
   - MongoDB connection string (see Step 4 in Installation above)
   - JWT secret (generate with: `node -p "require('crypto').randomBytes(64).toString('hex')"`)

5. **Run the application**:
   ```bash
   npm start
   ```

6. **Open browser**: Navigate to `http://localhost:3000`

### If You Want Your Own Copy (Fork)

If you want to create your own version of FinderAI:

1. **Fork the repository** on GitHub:
   - Go to https://github.com/KrisMatthew08/FinderAI
   - Click the "Fork" button (top right)
   - This creates a copy under your GitHub account

2. **Clone your forked repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FinderAI.git
   cd FinderAI
   ```

3. **Follow the installation steps** above

4. **Make your changes** and push to your fork:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

- `POST /api/auth/login` - Login and receive JWT token
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Items
- `POST /api/items/upload` - Upload lost/found item (authentication temporarily disabled for testing)
  - Body: FormData with fields:
    - `type`: "lost" or "found"
    - `category`: string (e.g., "Wallet", "Phone", "Keys")
    - `description`: string
    - `location`: string (where it was lost/found)
    - `image`: file (JPEG, PNG - max 5MB)

- `GET /api/items/search` - Search for matching items (authentication temporarily disabled for testing)
  - Returns: Array of matching items with similarity scores
  - Only returns unclaimed items

- `GET /api/items/image/:id` - Get image for a specific item
  - Returns: Image binary data

- `DELETE /api/items/delete/:id` - Delete an item
  - Returns: Confirmation message

- `PUT /api/items/claim/:id` - Mark an item as claimed/reunited
  - Returns: Updated item with claimed status

## Usage

1. **Upload a lost item**:
   - Select "Lost" as type
   - Enter category (e.g., "Wallet")
   - Add description and location
   - Upload clear image of the item

2. **Upload a found item**:
   - Select "Found" as type
   - Enter same category (e.g., "Wallet")
   - Add description and location
   - Upload image

3. **Search for matches**:
   - Click "Search for Matches"
   - AI will compare all lost and found items
   - Results show similarity scores (higher = better match)

4. **Manage items**:
   - **Mark as Claimed**: When item is reunited with owner
   - **Delete**: Remove item permanently

## How the AI Works

FinderAI uses two AI approaches:

### 1. **Simple Feature Extractor** (Default - Stable)
- Uses PIL and NumPy (lightweight, no GPU needed)
- Extracts 112-dimensional feature vectors:
  - **Color Histogram** (48 features): Overall color distribution
  - **Regional Colors** (48 features): 4×4 grid spatial layout
  - **Edge Detection** (16 features): Shape and texture patterns
- Fast and reliable for most lost & found items

### 2. **Vision Transformer (ViT)** (Advanced - Optional)
- Uses Hugging Face Transformers + PyTorch
- 768-dimensional embeddings
- More accurate but requires more memory
- May crash on some Windows systems

### Matching Algorithm
- **Cosine Similarity**: Compares feature vectors
- **Threshold**: 0.5 (50% similarity or higher)
- Results sorted by similarity score (highest first)

## Troubleshooting

### Python Issues

**"python: command not found"**
- Windows: Try `py` instead of `python`
- Add Python to system PATH
- Reinstall Python with "Add to PATH" checked

**"No module named 'PIL'"**
```bash
pip install pillow
```

**PyTorch installation fails**
- Use CPU-only version (smaller, faster):
  ```bash
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  ```

**"Exit code 3221226505" (Windows crash)**
- This is a PyTorch memory issue on Windows
- The app automatically uses the simple feature extractor instead
- No action needed - it will work fine!

### MongoDB Issues

**"MongoServerError: db already exists with different case"**
- Make sure `DB_NAME` in `.env` matches exactly: `FinderAI` (not `finderai`)

**"Connection refused" or "Cannot connect to MongoDB"**
- **Atlas**: Check your IP is whitelisted (Network Access in Atlas dashboard)
- **Local**: Make sure `mongod` is running
- Check connection string format in `.env`

### Node.js Issues

**"Cannot find module 'express'"**
```bash
npm install
```

**Port 3000 already in use**
- Change `PORT` in `.env` to another number (e.g., 3001)
- Or stop the other process using port 3000

**Images not showing**
- Clear browser cache
- Check uploads are working in terminal logs
- Verify MongoDB connection is active

### Git Issues

**"Permission denied (publickey)"**
- Set up SSH keys: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- Or use HTTPS URLs instead of SSH

**Accidentally committed `.env` file**
1. Remove from Git:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from repository"
   git push
   ```
2. **Immediately change all credentials** in `.env`
3. Add to `.gitignore` if not already there

---

## Privacy & Ethics

⚠️ **Important Privacy Notice**:
- Do NOT upload images containing faces or personal identifying information
- The system is designed for objects only (bags, phones, IDs, etc.)
- All uploads should respect data privacy laws
- Consider blurring sensitive information before uploading

## Project Structure

```
FinderAI/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema
│   └── Item.js              # Item schema with embeddings and claimed status
├── routes/
│   ├── auth.js              # Authentication routes
│   └── items.js             # Upload, search, delete, claim routes
├── public/
│   ├── index.html           # Frontend HTML
│   ├── style.css            # Styles
│   └── app.js               # Frontend JavaScript
├── uploads/                 # Temporary image storage (not in Git)
├── ai_processor.py          # ViT-based embeddings (advanced)
├── ai_processor_simple.py   # Simple feature extractor (default)
├── test_python.py           # Python environment test
├── server.js                # Main server file
├── package.json             # Node.js dependencies
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (NOT in Git)
├── .env.example             # Template for .env
├── .gitignore               # Files to exclude from Git
└── README.md                # This file
```

## Future Enhancements

- [ ] Re-enable JWT authentication for production
- [ ] Implement FAISS for faster similarity search at scale
- [ ] Add face detection to automatically reject uploads with faces
- [ ] Email/SMS notifications when matches are found
- [ ] User dashboard to view their uploaded items
- [ ] Admin panel for monitoring and moderation
- [ ] Mobile app (React Native)
- [ ] Real-time updates with WebSockets
- [ ] Multi-language support
- [ ] Location-based filtering
- [ ] Item categories with custom icons
- [ ] Export match reports as PDF

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m "Add feature description"`
5. Push: `git push origin feature-name`
6. Open a Pull Request

## License

ISC

## Author

**KrisMatthew08**
- GitHub: [@KrisMatthew08](https://github.com/KrisMatthew08)

## Acknowledgments

- **Hugging Face** for Transformers library and pre-trained models
- **MongoDB** for database services
- **Express.js** community for excellent web framework
- **PyTorch** team for deep learning framework
- All open-source contributors

---

## Quick Reference Commands

### Development
```bash
npm start              # Start the server
node server.js         # Alternative way to start
python test_python.py  # Test Python environment
```

### Git Commands
```bash
git status             # Check what files changed
git add .              # Stage all changes
git commit -m "msg"    # Commit with message
git push               # Push to GitHub
git pull               # Get latest changes
```

### Package Management
```bash
npm install            # Install Node.js packages
npm install <package>  # Add new Node package
pip install -r requirements.txt  # Install Python packages
pip freeze > requirements.txt    # Update requirements.txt
```

### MongoDB
```bash
mongod                 # Start local MongoDB
mongo                  # Open MongoDB shell
```

---

**Note**: This project uses local Python-based AI processing for better reliability and privacy. The system works offline once dependencies are installed. For production deployment, consider using cloud-based AI services or GPU servers for better performance at scale.

**Security Reminder**: Always keep your `.env` file secure and never commit it to version control. Rotate credentials regularly and use environment-specific configurations for development, staging, and production.