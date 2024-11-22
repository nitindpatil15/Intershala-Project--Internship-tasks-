const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const PDFDocument = require("pdfkit");
const { getFirestore } = require("firebase-admin/firestore");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "djolycs3p", // Replace with your Cloudinary cloud name
  api_key: "312795385641611", // Replace with your Cloudinary API key
  api_secret: "LY-p5HeXi85B5jPcnPIUQdcdJu0", // Replace with your Cloudinary API secret
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resume_photos",
    format: async () => "jpeg",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

// Route to upload photo to Cloudinary
router.post("/upload-photo", upload.single("photo"), async (req, res) => {
  try {
    const photoUrl = req.file.path;
    res.json({ photoUrl });
  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).send("Failed to upload photo");
  }
});

// Route to save resume data to Firestore and generate PDF
router.post("/save-resume", async (req, res) => {
  const { userId, resumeData } = req.body;
  try {
    // Download image from Cloudinary
    const imageUrl = resumeData.photoUrl;
    const imageResponse = await axios({
      url: imageUrl,
      responseType: "stream",
    });

    // Create a temporary file to store the image locally
    const tempImagePath = path.join(__dirname, `../tmp/temp-image.jpg`);
    const writer = fs.createWriteStream(tempImagePath);
    imageResponse.data.pipe(writer);

    writer.on("finish", async () => {
      // Generate the PDF
      const pdfDoc = new PDFDocument();
      const pdfFilePath = path.join(__dirname, `../tmp/resume-${userId}.pdf`);
      const writeStream = pdfDoc.pipe(fs.createWriteStream(pdfFilePath));

      // Add photo (use the local temp image path)
      pdfDoc.image(tempImagePath, {
        fit: [100, 100],
        align: "center",
      });
      pdfDoc.moveDown(5);
      // Add a title
      pdfDoc.fontSize(20).text(`Resume - ${resumeData.name}`, {
        align: "center",
        underline: true,
      });
      pdfDoc.moveDown();


      // Personal Details Section
      pdfDoc.fontSize(16).text("Personal Details", { underline: true });
      pdfDoc.fontSize(12).text(`Name: ${resumeData.name}`);
      pdfDoc.text(`Email: ${resumeData.email}`);
      pdfDoc.text(`Phone: ${resumeData.phone}`);
      pdfDoc.text(`LinkedIn: ${resumeData.linkedin}`);
      pdfDoc.text(`GitHub: ${resumeData.github}`);
      pdfDoc.text(`Portfolio: ${resumeData.portfolio}`);
      pdfDoc.moveDown();

      // Skills Section
      pdfDoc.fontSize(16).text("Skills", { underline: true });
      pdfDoc.fontSize(12).text(resumeData.skills.split(",").join(", "));
      pdfDoc.moveDown();

      // Qualification Section
      pdfDoc.fontSize(16).text("Education", { underline: true });
      pdfDoc.fontSize(12).text(resumeData.qualification);
      pdfDoc.moveDown();

      // Experience Section
      pdfDoc.fontSize(16).text("Experience", { underline: true });
      pdfDoc.fontSize(12).text(resumeData.experience);
      pdfDoc.moveDown();

      // Additional Information
      pdfDoc.fontSize(16).text("Personal Details", { underline: true });
      pdfDoc.fontSize(12).text(resumeData.personalDetails);
      pdfDoc.moveDown();

      pdfDoc.end();

      await new Promise((resolve, reject) =>
        writeStream.on("finish", resolve).on("error", reject)
      );

      // Upload PDF to Cloudinary
      const result = await cloudinary.uploader.upload(pdfFilePath, {
        resource_type: "raw",
        folder: "resumes",
      });

      // Save data and PDF URL in Firestore
      const db = getFirestore();
      const userDocRef = db.collection("users").doc(userId);
      await userDocRef.set(
        { resumeData, resumeGenerated: true, pdfUrl: result.secure_url },
        { merge: true }
      );

      // Clean up local files
      fs.unlinkSync(pdfFilePath);
      fs.unlinkSync(tempImagePath); // Delete the temporary image

      res.json({
        message: "Resume saved successfully!",
        pdfUrl: result.secure_url,
      });
    });
  } catch (error) {
    console.error("Error saving resume:", error);
    res.status(500).send("Failed to save resume");
  }
});

module.exports = router;
