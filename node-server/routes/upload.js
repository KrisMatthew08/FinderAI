const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
    if (req.file === undefined) {
        return res.status(400).json({ error: "No file provided" });
    }
    const port = process.env.PORT || 8080;
    const imgUrl = `http://localhost:${port}/images/${req.file.filename}`;
    return res.json({
        message: "File uploaded successfully",
        filename: req.file.filename,
        url: imgUrl,
        id: req.file.id,
    });
});

module.exports = router;
