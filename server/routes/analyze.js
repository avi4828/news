const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const { protect } = require('../middleware/auth');
const { analysisRateLimiter } = require('../middleware/rateLimiter');
const agentOrchestrator = require('../services/agentOrchestrator');
const Article = require('../models/Article');
const Report = require('../models/Report');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper: save article and create report
async function saveAndRespond(req, res, inputType, analysisData, extraFields = {}) {
  const result = await agentOrchestrator.analyze(analysisData);

  const article = await Article.create({
    userId: req.user._id,
    inputType,
    analysisResult: result,
    extractedText: result.extractedText,
    extractedClaims: result.claims || [],
    processingStatus: 'completed',
    ...extraFields,
  });

  // Increment user analysis count
  await req.user.updateOne({ $inc: { analysisCount: 1 } });

  // Auto-create report
  const report = await Report.create({
    userId: req.user._id,
    articleId: article._id,
    title: result.title || `Analysis #${article._id.toString().slice(-6)}`,
    analysisSnapshot: {
      fakeProbability: result.fakeProbability,
      trustScore: result.trustScore,
      biasLevel: result.biasLevel,
      aiGeneratedProbability: result.aiGeneratedProbability,
      factMatch: result.factMatch,
      finalVerdict: result.finalVerdict,
      explanation: result.explanation,
    },
  });

  res.status(201).json({
    success: true,
    articleId: article._id,
    reportId: report._id,
    result,
  });
}

// @route   POST /api/analyze/url
router.post('/url', protect, analysisRateLimiter, async (req, res) => {
  const schema = Joi.object({ url: Joi.string().uri().required() });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  await saveAndRespond(req, res, 'url',
    { type: 'url', url: req.body.url },
    { sourceURL: req.body.url }
  );
});

// @route   POST /api/analyze/text
router.post('/text', protect, analysisRateLimiter, async (req, res) => {
  const schema = Joi.object({ text: Joi.string().min(50).max(50000).required() });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  await saveAndRespond(req, res, 'text',
    { type: 'text', text: req.body.text },
    { articleText: req.body.text }
  );
});

// @route   POST /api/analyze/image
router.post('/image', protect, analysisRateLimiter, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }

  const imagePath = req.file.path;

  await saveAndRespond(req, res, 'image',
    { type: 'image', imagePath },
    { imagePath: req.file.filename }
  );
});

module.exports = router;
