const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const Article = require('../models/Article');
const User = require('../models/User');
const Report = require('../models/Report');

const router = express.Router();

// Apply auth + admin guard to all admin routes
router.use(protect, adminOnly);

// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [
    totalUsers,
    totalAnalyses,
    totalReports,
    verdictBreakdown,
    inputTypeBreakdown,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments(),
    Article.countDocuments({ processingStatus: 'completed' }),
    Report.countDocuments(),
    Article.aggregate([
      { $match: { processingStatus: 'completed' } },
      { $group: { _id: '$analysisResult.finalVerdict', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Article.aggregate([
      { $group: { _id: '$inputType', count: { $sum: 1 } } },
    ]),
    Article.find({ processingStatus: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('inputType sourceURL analysisResult.finalVerdict analysisResult.fakeProbability createdAt')
      .populate('userId', 'username email'),
  ]);

  // Average scores
  const avgScores = await Article.aggregate([
    { $match: { processingStatus: 'completed' } },
    {
      $group: {
        _id: null,
        avgFakeProbability: { $avg: '$analysisResult.fakeProbability' },
        avgTrustScore: { $avg: '$analysisResult.trustScore' },
        avgBiasScore: { $avg: '$analysisResult.biasScore' },
        avgAiProbability: { $avg: '$analysisResult.aiGeneratedProbability' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      overview: { totalUsers, totalAnalyses, totalReports },
      verdictBreakdown,
      inputTypeBreakdown,
      avgScores: avgScores[0] || {},
      recentActivity,
    },
  });
});

// @route   GET /api/admin/trending
router.get('/trending', async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [trendingFakeNews, topMisinformationSources, dailyTrend] = await Promise.all([
    // Highest fake probability articles
    Article.find({
      processingStatus: 'completed',
      createdAt: { $gte: since },
      'analysisResult.fakeProbability': { $gte: 70 },
    })
      .sort({ 'analysisResult.fakeProbability': -1 })
      .limit(10)
      .select('sourceURL title analysisResult.fakeProbability analysisResult.finalVerdict createdAt'),

    // Top suspicious domains
    Article.aggregate([
      { $match: { processingStatus: 'completed', createdAt: { $gte: since }, sourceURL: { $exists: true, $ne: null } } },
      { $group: {
        _id: { $toLower: { $arrayElemAt: [{ $split: ['$sourceURL', '/'] }, 2] } },
        count: { $sum: 1 },
        avgFakeProbability: { $avg: '$analysisResult.fakeProbability' },
      }},
      { $sort: { avgFakeProbability: -1 } },
      { $limit: 10 },
    ]),

    // Daily analysis counts
    Article.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: 1 },
        fakeNews: { $sum: { $cond: [{ $gte: ['$analysisResult.fakeProbability', 60] }, 1, 0] } },
      }},
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: { trendingFakeNews, topMisinformationSources, dailyTrend },
  });
});

// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select('-password')
    .limit(50);

  res.json({ success: true, data: users });
});

module.exports = router;
