const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/finderai",
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

        if (allowedMimeTypes.indexOf(file.mimetype) === -1) {
            // Not an image; store but flag
            const filename = `${Date.now()}-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: "images",
            filename: `${Date.now()}-${file.originalname}`,
        };
    },
});

module.exports = multer({ storage });
