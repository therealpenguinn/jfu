const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.static("public")); // Serve static files (like index.html)
app.use(express.json());  // To parse JSON data if needed for upload path
app.use(express.urlencoded({ extended: true })); // To parse form data (in case the path is passed via form)

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Change default from "uploads" to "jellyfin/uploads"
        let uploadPath = req.body.path || "jellyfin/uploads";

        // Ensure correct base path starts with "jellyfin/uploads"
        if (!uploadPath.startsWith("jellyfin/uploads")) {
            uploadPath = "jellyfin/uploads";
        }

        // Always use __dirname as baseDir instead of process.env.HOME
        let baseDir = __dirname; // changed: removed conditional for non-Windows

        // Build the final upload path
        const finalPath = path.join(baseDir, uploadPath);

        // Log the directory path being used
        console.log("Saving files to directory:", finalPath);

        // Ensure the path exists, create it if not
        fs.mkdirSync(finalPath, { recursive: true });

        cb(null, finalPath);
    },
    filename: function (req, file, cb) {
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9-_.\s]/g, '');
        cb(null, sanitizedFileName);
    }
});

const upload = multer({ storage });

// Serve the index.html page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// File upload endpoint
app.post("/upload", upload.array("files"), (req, res) => {
    try {
        console.log("Received files:", req.files);
        console.log("Upload path:", req.body.path);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded." });
        }
        res.json({ success: true, message: "Files uploaded successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error uploading files: " + error.message });
    }
});

// Start the server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
