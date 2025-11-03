# FinderAI - AI-Powered Lost & Found System

FinderAI is an intelligent lost-and-found platform that uses AI-powered image recognition to help people find their lost items. The system matches lost items with found items using advanced computer vision techniques with 768-dimensional feature vectors similar to Vision Transformer (ViT) models.

## Features

- 🔐 **User Authentication**: Secure signup and login with JWT tokens
- 📸 **Image Upload**: Upload images of lost or found items
- 🤖 **Advanced AI Matching**: 768-dimensional feature extraction using sophisticated computer vision
- 🔍 **Smart Search**: Cosine similarity-based matching to find similar items
- � **Student ID Tracking**: Track items by student ID for accountability
- 📅 **Date Tracking**: Record when items were found or lost
- 🖼️ **Image Preview**: Preview images before uploading
- ✅ **Success Messages**: Clear feedback on uploads and matches
- 🛡️ **Admin Dashboard**: Manage items, find matches, and mark items as claimed
- 📱 **Responsive Design**: Clean, user-friendly interface

## Tech Stack

### Backend
- **Node.js** & **Express 5.1.0**: Server framework
- **MongoDB** & **Mongoose 8.19.2**: Database
- **Multer**: File upload handling
- **Sharp**: Image processing and optimization
- **JWT**: Authentication with bcryptjs
- **dotenv**: Environment configuration

### Frontend
- **HTML/CSS/JavaScript**: Simple, responsive UI
- **Fetch API**: Communication with backend
- **Modal popups**: User feedback and interactions

### AI/ML
- **Python 3.x**: Local AI processing
- **OpenCV (cv2)**: Advanced computer vision
- **NumPy**: Numerical computations
- **SciPy**: Scientific computing for image processing
- **PIL (Pillow)**: Image loading and preprocessing
- **768-Dimensional Features**: ViT-like embeddings
  - Color features (256 dims): RGB, HSV, LAB histograms and spatial distributions
  - Texture features (256 dims): LBP, Gabor-like filters, multi-scale gradients
  - Shape features (256 dims): Canny edges, Harris corners, Hough lines, HOG
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
pip install opencv-python scipy pillow numpy
```

This installs:
- **opencv-python** (cv2): Advanced computer vision operations
- **scipy**: Scientific computing for image processing
- **pillow**: Image loading and manipulation
- **numpy**: Numerical array operations

**If pip install fails**, try:
```bash
python -m pip install opencv-python scipy pillow numpy
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

FinderAI uses an **Enhanced Computer Vision Processor** that generates 768-dimensional feature vectors similar to Vision Transformer (ViT) embeddings, but without requiring heavy ML libraries or GPU.

### **Enhanced Feature Extraction (768 Dimensions)**

The system extracts three types of advanced visual features:

#### **1. Color Features (256 dimensions)**
- **RGB Histograms** (48 dims): Overall color distribution across red, green, blue channels
- **HSV Histograms** (48 dims): Hue, saturation, value color space for better color perception
- **LAB Color Space** (48 dims): Perceptual color space closer to human vision
- **Spatial Color Grid** (64 dims): Average colors in 8×8 grid for spatial layout
- **Color Moments** (48 dims): Mean, standard deviation, skewness in 4×4 regions

#### **2. Texture Features (256 dimensions)**
- **Local Variance Patterns** (64 dims): Texture roughness in 8×8 grid
- **Multi-Orientation Gradients** (64 dims): Gabor-like filters at 8 different angles
- **Multi-Scale Gradients** (64 dims): Edge detection at 4 different scales
- **Edge Orientation Histograms** (64 dims): Distribution of edge directions

#### **3. Shape Features (256 dimensions)**
- **Multi-Threshold Canny Edges** (64 dims): Edge maps at different sensitivity levels
- **Harris Corner Detection** (64 dims): Corner and keypoint density in 8×8 grid
- **Hough Line Detection** (64 dims): Line detection in different orientations
- **Contour Features** (64 dims): Object boundary density
- **HOG-inspired Features** (64 dims): Histogram of Oriented Gradients

### **Matching Algorithm**
- **Cosine Similarity**: Compares 768-dimensional feature vectors
- **Category Boost**: 20% higher similarity for matching categories
- **Threshold**: 0.5 (50% similarity or higher)
- **Results**: Sorted by similarity score (highest first)
- **Color-Coded**: Green (>80%), Yellow (70-80%), Gray (50-70%)

### **Why 768 Dimensions?**
- Same dimensionality as Vision Transformer (ViT-Base) models
- Much more discriminative than simple 112-dimensional features
- Captures complex patterns: object shapes, textures, spatial layouts
- Better distinction between similar-looking but different objects
- Example: PS4 controller vs notebook now show much lower similarity

### **Advantages Over Simple Features**
| Feature | Simple (112D) | Enhanced (768D) |
|---------|---------------|-----------------|
| **Dimensions** | 112 | 768 (6.8× more) |
| **Color Analysis** | Basic RGB | RGB + HSV + LAB |
| **Texture** | Simple edges | Multi-scale, multi-orientation |
| **Shape** | Basic gradients | Corners, lines, contours, HOG |
| **Accuracy** | ~90% false matches | Much better discrimination |
| **Speed** | Very fast | Still fast (no GPU needed) |

## Troubleshooting

### Python Issues

**"python: command not found"**
- Windows: Try `py` instead of `python`
- Add Python to system PATH
- Reinstall Python with "Add to PATH" checked

**"No module named 'cv2'"**
```bash
pip install opencv-python
```

**"No module named 'scipy'"**
```bash
pip install scipy
```

**OpenCV installation fails**
- Try: `pip install opencv-python-headless` (lighter version)
- Or: `pip install --upgrade pip` then try again

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
│   ├── User.js              # User schema with studentId
│   └── Item.js              # Item schema with embeddings, claimed status, dateReported
├── routes/
│   ├── auth.js              # Authentication routes (login, register)
│   └── items.js             # Upload, search, delete, claim, update routes
├── public/
│   ├── index.html           # User interface for reporting items
│   ├── admin.html           # Admin dashboard for managing items
│   ├── style.css            # Styles
│   └── app.js               # Frontend JavaScript
├── uploads/                 # Temporary image storage (not in Git)
├── ai_processor_enhanced.py # 768D enhanced CV feature extractor
├── server.js                # Main server file
├── package.json             # Node.js dependencies
├── .env                     # Environment variables (NOT in Git)
├── .env.example             # Template for .env
├── .gitignore               # Files to exclude from Git
└── README.md                # This file
```

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications when matches are found
- [ ] Email/SMS alerts for high-similarity matches
- [ ] QR code generation for found items
- [ ] Location-based filtering and maps
- [ ] Multi-language support
- [ ] Export match reports as PDF
- [ ] Analytics dashboard for admin
- [ ] Batch upload for multiple items
- [ ] Advanced search filters (date range, location, category)
- [ ] Item history and audit trail
- [ ] Integration with school database systems

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
pip install opencv-python scipy pillow numpy  # Install Python packages
pip freeze > requirements.txt    # Update requirements.txt (if needed)
```

### MongoDB
```bash
mongod                 # Start local MongoDB
mongo                  # Open MongoDB shell
```

---

**Note**: This project uses local Python-based AI processing with advanced computer vision for better reliability, privacy, and accuracy. The 768-dimensional feature extraction provides ViT-like performance without requiring GPU or heavy ML frameworks. The system works completely offline once dependencies are installed.

**Security Reminder**: Always keep your `.env` file secure and never commit it to version control. Rotate credentials regularly and use environment-specific configurations for development, staging, and production.