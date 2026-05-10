const contentExtractor = require('./contentExtractor');
const factVerifier = require('./factVerifier');
const sourceCredibility = require('./sourceCredibility');
const biasDetector = require('./biasDetector');
const aiContentDetector = require('./aiContentDetector');
const finalJudge = require('./finalJudge');

/**
 * Agent Orchestrator
 * Coordinates all 6 AI agents in sequence/parallel:
 *
 * [Agent 1] Content Extraction  (sequential - must run first)
 *       ↓
 * [Agent 2] Fact Verification  ─┐
 * [Agent 3] Source Credibility  ├─ Parallel
 * [Agent 4] Bias Detection      ┤
 * [Agent 5] AI Content Detect  ─┘
 *       ↓
 * [Agent 6] Final Judge  (sequential - aggregates everything)
 */
async function analyze(input) {
  console.log(`\n🤖 [Orchestrator] Starting multi-agent analysis (type: ${input.type})`);
  const startTime = Date.now();

  // ─── AGENT 1: Content Extraction ───────────────────────────
  console.log('  [1/6] Content Extraction Agent running...');
  const extractionResult = await contentExtractor.extract(input);
  console.log(`  [1/6] ✅ Extracted ${extractionResult.wordCount || 0} words`);

  const { extractedText, title, author, publishedDate, source } = extractionResult;

  // ─── AGENTS 2–5: Run in Parallel ───────────────────────────
  console.log('  [2-5/6] Running parallel agents...');
  const [factVerification, sourceCrediblityResult, biasDetection, aiContentDetection] = await Promise.all([
    factVerifier.verify(extractedText, input.url || source),
    sourceCredibility.analyze(input.url || source),
    biasDetector.detect(extractedText),
    aiContentDetector.detect(extractedText),
  ]);
  console.log('  [2-5/6] ✅ Parallel agents complete');

  // ─── AGENT 6: Final Judge ───────────────────────────────────
  console.log('  [6/6] Final Judge Agent running...');
  const verdict = await finalJudge.judge({
    extractionResult,
    factVerification,
    sourceCredibility: sourceCrediblityResult,
    biasDetection,
    aiContentDetection,
  });
  console.log(`  [6/6] ✅ Verdict: ${verdict.finalVerdict}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ [Orchestrator] Analysis complete in ${elapsed}s\n`);

  // ─── Compose Final Result ────────────────────────────────────
  return {
    // Metadata
    title: title || 'Untitled Article',
    author,
    publishedDate,
    source: input.url || source,
    extractedText,
    wordCount: extractionResult.wordCount,

    // Agent outputs
    fakeProbability: verdict.fakeProbability,
    trustScore: verdict.trustScore,
    biasScore: biasDetection.biasScore,
    biasLevel: biasDetection.biasLevel,
    sentimentScore: biasDetection.sentimentScore,
    aiGeneratedProbability: aiContentDetection.aiGeneratedProbability,
    sourceReputation: sourceCrediblityResult.sourceReputationScore,
    factMatch: factVerification.factMatchScore,
    finalVerdict: verdict.finalVerdict,
    explanation: verdict.explanation,
    recommendations: verdict.recommendations,
    propagandaTechniques: biasDetection.propagandaTechniques,
    politicalLeaning: biasDetection.politicalLeaning,
    claims: factVerification.claims,

    // Full agent reports (for detailed view)
    agentReports: {
      contentExtraction: extractionResult,
      factVerification,
      sourceCredibility: sourceCrediblityResult,
      biasDetection,
      aiContentDetection,
      finalJudge: verdict,
    },

    processingTimeSeconds: parseFloat(elapsed),
  };
}

module.exports = { analyze };
