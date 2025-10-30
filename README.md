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
- **Hugging Face API**: Vision Transformer (ViT) for image embeddings
- **Cosine Similarity**: Vector comparison for matching

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Hugging Face account (for API key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KrisMatthew08/FinderAI.git
   cd FinderAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   PORT=3000
   ```

4. **Get your Hugging Face API key**
   - Sign up at [https://huggingface.co](https://huggingface.co)
   - Go to Settings > Access Tokens
   - Create a new token with "Read" permissions
   - Copy the token to your `.env` file

5. **Start MongoDB**
   - Local: Run `mongod`
   - Atlas: Use your connection string in `.env`

6. **Run the application**
   ```bash
   npm start
   ```

7. **Open in browser**
   - Navigate to `http://localhost:3000`

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
- `POST /api/items/upload` - Upload lost/found item (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with fields:
    - `type`: "lost" or "found"
    - `category`: string
    - `description`: string
    - `location`: string
    - `image`: file

- `GET /api/items/search` - Search for matching items (requires authentication)
  - Headers: `Authorization: Bearer <token>`
  - Returns: Array of matching items with similarity scores

## Usage

1. **Sign up** for an account or **login**
2. **Upload** a lost or found item with an image
3. **Search** to find potential matches based on AI similarity
4. View matches with similarity scores to identify your item

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
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── User.js           # User schema
│   └── Item.js           # Item schema with embeddings
├── routes/
│   ├── auth.js           # Authentication routes
│   └── items.js          # Item upload and search routes
├── public/
│   ├── index.html        # Frontend HTML
│   ├── style.css         # Styles
│   └── app.js            # Frontend JavaScript
├── uploads/              # Uploaded images directory
├── server.js             # Main server file
├── package.json          # Dependencies
└── .env                  # Environment variables (not in repo)
```

## Future Enhancements

- [ ] Implement FAISS for faster similarity search at scale
- [ ] Add face detection to automatically reject uploads with faces
- [ ] Email notifications for matches
- [ ] Admin dashboard for monitoring
- [ ] Mobile app (React Native)
- [ ] Real-time updates with WebSockets
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

KrisMatthew08

## Acknowledgments

- Hugging Face for providing the Vision Transformer API
- MongoDB for database services
- Express.js community

---

**Note**: This is a student project for educational purposes. For production use, additional security measures and optimizations are recommended.