const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claim: String,
  verified: Boolean,
  confidence: Number,
  sources: [String],
});

const analysisResultSchema = new mongoose.Schema({
  fakeProbability: { type: Number, min: 0, max: 100 },
  trustScore: { type: Number, min: 0, max: 100 },
  biasScore: { type: Number, min: 0, max: 100 },
  biasLevel: { type: String, enum: ['None', 'Low', 'Moderate', 'High', 'Extreme'] },
  sentimentScore: { type: Number, min: -1, max: 1 },
  aiGeneratedProbability: { type: Number, min: 0, max: 100 },
  sourceReputation: { type: Number, min: 0, max: 100 },
  factMatch: { type: Number, min: 0, max: 100 },
  finalVerdict: {
    type: String,
    enum: ['Verified Accurate', 'Mostly Accurate', 'Mixed', 'Likely Misleading', 'Likely Fake News', 'Dangerous Misinformation'],
  },
  explanation: String,
  propagandaTechniques: [String],
  politicalLeaning: String,
  recommendations: [String],
  agentReports: {
    contentExtraction: mongoose.Schema.Types.Mixed,
    factVerification: mongoose.Schema.Types.Mixed,
    sourceCredibility: mongoose.Schema.Types.Mixed,
    biasDetection: mongoose.Schema.Types.Mixed,
    aiContentDetection: mongoose.Schema.Types.Mixed,
    finalJudge: mongoose.Schema.Types.Mixed,
  },
});

const articleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inputType: {
    type: String,
    enum: ['url', 'text', 'image'],
    required: true,
  },
  sourceURL: {
    type: String,
    trim: true,
  },
  articleText: {
    type: String,
  },
  extractedText: {
    type: String,
  },
  title: {
    type: String,
  },
  imagePath: {
    type: String,
  },
  extractedClaims: [claimSchema],
  analysisResult: analysisResultSchema,
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  processingError: String,
}, { timestamps: true });

// Index for efficient queries
articleSchema.index({ userId: 1, createdAt: -1 });
articleSchema.index({ 'analysisResult.finalVerdict': 1 });
articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);
