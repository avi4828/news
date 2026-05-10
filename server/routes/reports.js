const express = require('express');
const path = require('path');
const { protect } = require('../middleware/auth');
const Report = require('../models/Report');
const Article = require('../models/Article');
const pdfGenerator = require('../services/pdfGenerator');

const router = express.Router();

// @route   GET /api/reports
router.get('/', protect, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('articleId', 'inputType sourceURL createdAt'),
    Report.countDocuments({ userId: req.user._id }),
  ]);

  res.json({
    success: true,
    data: reports,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @route   GET /api/reports/:id
router.get('/:id', protect, async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('articleId');

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.json({ success: true, data: report });
});

// @route   GET /api/reports/:id/pdf
router.get('/:id/pdf', protect, async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('articleId');

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  // Generate PDF on the fly
  const pdfBuffer = await pdfGenerator.generate(report);

  await Report.findByIdAndUpdate(report._id, { $inc: { downloadCount: 1 } });

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="truthlens-report-${report._id}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
});

// @route   DELETE /api/reports/:id
router.delete('/:id', protect, async (req, res) => {
  const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }
  res.json({ success: true, message: 'Report deleted successfully' });
});

module.exports = router;
