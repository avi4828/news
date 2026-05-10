const PDFDocument = require('pdfkit');

/**
 * Generates a professional PDF report using pdfkit
 */
async function generate(report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const snap = report.analysisSnapshot || {};
    const article = report.articleId || {};
    const verdictColor = getVerdictColor(snap.finalVerdict);

    // ── HEADER ──────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
    doc.fillColor('#06b6d4').font('Helvetica-Bold').fontSize(22).text('TruthLens AI', 50, 25);
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('Multi-Agent Fake News Intelligence Report', 50, 52);
    doc.fillColor('#64748b').text(`Generated: ${new Date(report.createdAt).toLocaleString()}`, 50, 66);

    doc.moveDown(2);

    // ── VERDICT BANNER ───────────────────────────────────────────
    doc.y = 110;
    doc.rect(50, doc.y, doc.page.width - 100, 50).fill(verdictColor);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16)
      .text(`Verdict: ${snap.finalVerdict || 'Unknown'}`, 70, doc.y + 15, { align: 'center' });

    doc.y = 180;

    // ── ARTICLE INFO ─────────────────────────────────────────────
    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(12).text('Article Information', 50, doc.y);
    doc.moveTo(50, doc.y + 16).lineTo(545, doc.y + 16).stroke('#e2e8f0');
    doc.moveDown(0.5);

    doc.fillColor('#374151').font('Helvetica').fontSize(10);
    doc.text(`Report ID: ${report._id}`, 50);
    doc.text(`Input Type: ${article.inputType || 'Unknown'}`);
    if (article.sourceURL) doc.text(`Source URL: ${article.sourceURL}`);
    doc.moveDown(1);

    // ── SCORE GRID ────────────────────────────────────────────────
    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(12).text('Analysis Scores');
    doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).stroke('#e2e8f0');
    doc.moveDown(0.5);

    const scores = [
      { label: 'Fake News Probability', value: `${snap.fakeProbability ?? '--'}%`, color: getScoreColor(snap.fakeProbability, true) },
      { label: 'Trust Score', value: `${snap.trustScore ?? '--'}%`, color: getScoreColor(snap.trustScore, false) },
      { label: 'Bias Level', value: snap.biasLevel || '--', color: '#6366f1' },
      { label: 'AI-Generated Probability', value: `${snap.aiGeneratedProbability ?? '--'}%`, color: getScoreColor(snap.aiGeneratedProbability, true) },
      { label: 'Fact Match', value: `${snap.factMatch ?? '--'}%`, color: getScoreColor(snap.factMatch, false) },
    ];

    let gridX = 50;
    scores.forEach((score, i) => {
      if (i % 2 === 0 && i > 0) { doc.y += 50; gridX = 50; }
      const colWidth = 240;
      const x = i % 2 === 0 ? 50 : 305;

      doc.rect(x, doc.y, colWidth, 40).fill('#f8fafc').stroke('#e2e8f0');
      doc.fillColor(score.color).font('Helvetica-Bold').fontSize(14).text(score.value, x + 8, doc.y + 6, { width: colWidth - 60 });
      doc.fillColor('#64748b').font('Helvetica').fontSize(9).text(score.label, x + 8, doc.y + 24, { width: colWidth - 16 });
    });

    doc.y += 60;
    doc.moveDown(0.5);

    // ── EXPLANATION ────────────────────────────────────────────────
    doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(12).text('AI Explanation');
    doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).stroke('#e2e8f0');
    doc.moveDown(0.5);
    doc.fillColor('#374151').font('Helvetica').fontSize(10)
      .text(snap.explanation || 'No explanation available.', 50, doc.y, { width: 495, align: 'justify' });

    doc.moveDown(1.5);

    // ── FOOTER ─────────────────────────────────────────────────────
    const footerY = doc.page.height - 50;
    doc.rect(0, footerY - 10, doc.page.width, 60).fill('#0f172a');
    doc.fillColor('#64748b').font('Helvetica').fontSize(9)
      .text('TruthLens AI — Confidential Analysis Report', 50, footerY, { align: 'center', width: doc.page.width - 100 });
    doc.fillColor('#475569').text('This report is AI-generated. Always verify important information independently.', 50, footerY + 12, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  });
}

function getVerdictColor(verdict) {
  const map = {
    'Verified Accurate': '#16a34a',
    'Mostly Accurate': '#65a30d',
    'Mixed': '#d97706',
    'Likely Misleading': '#ea580c',
    'Likely Fake News': '#dc2626',
    'Dangerous Misinformation': '#7f1d1d',
  };
  return map[verdict] || '#6b7280';
}

function getScoreColor(value, inverse = false) {
  if (value === undefined || value === null) return '#64748b';
  const v = inverse ? 100 - value : value;
  if (v >= 70) return '#16a34a';
  if (v >= 45) return '#d97706';
  return '#dc2626';
}

module.exports = { generate };
