const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  title: {
    type: String,
    default: 'Analysis Report',
  },
  pdfPath: {
    type: String,
  },
  analysisSnapshot: {
    fakeProbability: Number,
    trustScore: Number,
    biasLevel: String,
    aiGeneratedProbability: Number,
    factMatch: Number,
    finalVerdict: String,
    explanation: String,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
