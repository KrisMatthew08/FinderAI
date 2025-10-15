# FinderAI

This repo contains a simple image-based lost & found prototype with a Node/Express backend and a React frontend.

## Prerequisites
- Node.js 18+
- MongoDB running locally (default URI mongodb://localhost:27017)

## Backend (finderai-backend)

Environment file `.env`:

```
MONGO_URI=mongodb://localhost:27017/finderai
PORT=5000
```

Install and run:

```
cd finderai-backend
npm install
npm run dev
```

## Frontend (finderai-frontend)

Environment file `.env`:

```
REACT_APP_API_BASE=http://localhost:5000
```

Install and start:

```
cd finderai-frontend
npm install
npm start
```

Open http://localhost:3000 in your browser. Upload a test image, select Lost/Found, and see matches.

## Notes
- Images are stored in MongoDB GridFS and compared with a perceptual hash (pHash). Threshold default is 18 (lower is stricter).
- Temporary files are stored under `finderai-backend/temp_uploads` and cleaned after upload.
- For production, consider using S3/Cloud Storage and a vector database for embeddings.