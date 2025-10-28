# Node.js Image Service (GridFS)

A simple Express + MongoDB GridFS service for uploading, retrieving, and deleting images.

## Setup

```powershell
cd node-server
npm install
```

Copy `.env.example` to `.env` and adjust if needed:

```powershell
copy .env.example .env
```

## Run

```powershell
npm start
```

Or with auto-reload during development:

```powershell
npm run dev
```

Server will start on http://localhost:8080 (or PORT from .env).

## Endpoints

- **GET /healthz** — health check
- **POST /images/upload** — upload image (multipart/form-data with field `file`)
- **GET /images/:filename** — retrieve image by filename
- **DELETE /images/:filename** — delete image by filename

## Example usage (PowerShell)

Upload:
```powershell
curl.exe -F "file=@test.png" http://localhost:8080/images/upload
```

Retrieve:
```
http://localhost:8080/images/1698408000000-test.png
```

Delete:
```powershell
curl.exe -X DELETE http://localhost:8080/images/1698408000000-test.png
```

## Notes

- Images are stored in MongoDB GridFS under the `images` bucket.
- Filenames are prefixed with a timestamp to avoid collisions.
- Allowed image types: png, jpeg, jpg, gif, webp.
