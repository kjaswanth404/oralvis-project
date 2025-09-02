const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const PDFDocument = require("pdfkit");
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3000;
// Use the secret key from the environment file
const secretKey = process.env.JWT_SECRET_KEY;

// Cloudinary configuration (now uses environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const db = new sqlite3.Database("./oralvis.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);
  console.log("Users table created or already exists.");

  db.run(`CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT NOT NULL,
    patientId TEXT NOT NULL,
    scanType TEXT NOT NULL,
    region TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    uploadDate TEXT NOT NULL
  )`);
  console.log("Scans table created or already exists.");

  // Seed the database with a Technician and Dentist user
  const users = [
    { email: "tech@oralvis.com", password: "password123", role: "Technician" },
    { email: "dentist@oralvis.com", password: "password123", role: "Dentist" },
  ];

  users.forEach((user) => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) throw err;
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)"
      );
      stmt.run(user.email, hash, user.role);
      stmt.finalize();
    });
  });
});

app.use(express.json());
app.use(cors());

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(401).send("Authentication failed.");
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).send("Authentication failed.");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secretKey,
        { expiresIn: "1h" }
      );
      res.json({ token, role: user.role });
    });
  });
});

// Multer middleware to handle file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload endpoint for Technician
app.post(
  "/upload",
  authenticateToken,
  upload.single("scanImage"),
  (req, res) => {
    if (req.user.role !== "Technician") {
      return res.status(403).send("Forbidden. Only Technicians can upload scans.");
    }

    if (!req.file) {
      return res.status(400).send("No image file provided.");
    }

    const { patientName, patientId, scanType, region } = req.body;
    const imageData = req.file.buffer.toString("base64");
    const uploadDate = new Date().toISOString();

    cloudinary.uploader
      .upload(`data:${req.file.mimetype};base64,${imageData}`, {
        folder: "oralvis",
      })
      .then((result) => {
        db.run(
          `INSERT INTO scans (patientName, patientId, scanType, region, imageUrl, uploadDate)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            patientName,
            patientId,
            scanType,
            region,
            result.secure_url,
            uploadDate,
          ],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Scan uploaded successfully!", id: this.lastID });
          }
        );
      })
      .catch((error) => {
        console.error("Cloudinary upload failed:", error);
        res.status(500).json({ error: "Cloudinary upload failed. Check the backend terminal for details." });
      });
  }
);

// Endpoint for Dentists to view all scans
app.get("/scans", authenticateToken, (req, res) => {
  if (req.user.role !== "Dentist") {
    return res.status(403).send("Forbidden. Only Dentists can view scans.");
  }

  const sql = "SELECT * FROM scans ORDER BY uploadDate DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// New endpoint to generate and download a PDF report
app.get("/generate-pdf/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "Dentist") {
      return res.status(403).send("Forbidden. Only Dentists can generate reports.");
    }

    const scanId = req.params.id;

    db.get("SELECT * FROM scans WHERE id = ?", [scanId], (err, scan) => {
      if (err || !scan) {
        return res.status(404).json({ error: "Scan not found." });
      }

      const doc = new PDFDocument();
      const filename = `report_${scan.patientId}.pdf`;

      res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-type", "application/pdf");

      doc.pipe(res);

      doc.fontSize(20).text(`OralVis Healthcare - Patient Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Patient Name: ${scan.patientName}`);
      doc.text(`Patient ID: ${scan.patientId}`);
      doc.text(`Scan Type: ${scan.scanType}`);
      doc.text(`Region: ${scan.region}`);
      doc.text(`Upload Date: ${new Date(scan.uploadDate).toLocaleString()}`);
      doc.moveDown();

      doc.image(scan.imageUrl, {
          fit: [500, 400],
          align: 'center',
          valign: 'center'
      });

      doc.end();
    });
});

app.listen(port, () => {
  console.log(`OralVis backend running at http://localhost:${port}`);
});

module.exports = db;