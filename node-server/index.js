require("dotenv").config();
const upload = require("./routes/upload");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const connection = require("./db");
const express = require("express");
const app = express();

let gfs;
connection();

const conn = mongoose.connection;
conn.once("open", function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("images");
    console.log("✓ GridFS initialized with 'images' collection");
});

// Middleware
app.use(express.json());

// Health check
app.get("/healthz", (req, res) => {
    res.json({ status: "ok", service: "FinderAI Image Service" });
});

// Upload route
app.use("/images", upload);

// Get image by filename
app.get("/images/:filename", async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        const readStream = gfs.createReadStream(file.filename);
        res.set("Content-Type", file.contentType || "application/octet-stream");
        readStream.pipe(res);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({ error: "Error retrieving file" });
    }
});

// Delete image by filename
app.delete("/images/:filename", async (req, res) => {
    try {
        const result = await gfs.files.deleteOne({ filename: req.params.filename });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "File not found" });
        }
        res.json({ message: "File deleted successfully", filename: req.params.filename });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`✓ Server listening on http://localhost:${port}`);
    console.log(`  Endpoints:`);
    console.log(`    GET  /healthz`);
    console.log(`    POST /images/upload (multipart/form-data with 'file' field)`);
    console.log(`    GET  /images/:filename`);
    console.log(`    DELETE /images/:filename`);
});
