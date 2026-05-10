const agentConfig = require('../config/agents');
const { callAnakinWorkflow } = require('./anakinClient');

/**
 * Agent 6: Final Judge
 * - Aggregates all agent scores
 * - Generates final verdict + explanation
 * - Produces recommendations
 */
async function judge(agentOutputs) {
  const workflowResult = await callAnakinWorkflow(
    agentConfig.workflows.finalJudge,
    agentOutputs
  );

  if (workflowResult) return workflowResult;

  return computeLocally(agentOutputs);
}

function computeLocally(outputs) {
  const {
    factVerification,
    sourceCredibility,
    biasDetection,
    aiContentDetection,
  } = outputs;

  const factMatch = factVerification?.factMatchScore ?? 50;
  const sourceRep = sourceCredibility?.sourceReputationScore ?? 50;
  const biasScore = biasDetection?.biasScore ?? 50;
  const aiProb = aiContentDetection?.aiGeneratedProbability ?? 30;

  // Weighted fake probability formula
  // Low fact match, low source rep, high bias → high fake probability
  const fakeProbability = Math.round(
    (100 - factMatch) * 0.35 +    // Fact mismatch contributes 35%
    (100 - sourceRep) * 0.30 +    // Source untrustworthiness 30%
    biasScore * 0.25 +             // Bias score 25%
    aiProb * 0.10                  // AI content 10%
  );

  const trustScore = Math.round(100 - fakeProbability * 0.85);

  // Verdict determination
  let finalVerdict;
  if (fakeProbability >= 80) finalVerdict = 'Dangerous Misinformation';
  else if (fakeProbability >= 65) finalVerdict = 'Likely Fake News';
  else if (fakeProbability >= 50) finalVerdict = 'Likely Misleading';
  else if (fakeProbability >= 35) finalVerdict = 'Mixed';
  else if (fakeProbability >= 20) finalVerdict = 'Mostly Accurate';
  else finalVerdict = 'Verified Accurate';

  // Generate explanation
  const explanationParts = [];

  if (factMatch < 30) {
    explanationParts.push(`Only ${factMatch}% of extracted claims could be verified through trusted sources.`);
  } else if (factMatch < 60) {
    explanationParts.push(`${factMatch}% of claims are partially supported, with significant gaps in evidence.`);
  } else {
    explanationParts.push(`${factMatch}% of claims are supported by credible sources.`);
  }

  if (sourceRep < 40) {
    explanationParts.push(`The source domain has low credibility (${sourceRep}/100) with suspicious characteristics.`);
  } else if (sourceRep > 75) {
    explanationParts.push(`The source is from a recognized credible outlet (reputation: ${sourceRep}/100).`);
  }

  if (biasDetection?.propagandaTechniques?.length > 0) {
    explanationParts.push(`Propaganda techniques detected: ${biasDetection.propagandaTechniques.slice(0, 3).join(', ')}.`);
  }

  if (biasDetection?.urgencyManipulation) {
    explanationParts.push(`The content uses urgency manipulation tactics to pressure immediate sharing.`);
  }

  if (aiProb > 70) {
    explanationParts.push(`High probability (${aiProb}%) that this content was AI-generated or heavily assisted.`);
  }

  const explanation = explanationParts.join(' ');

  // Recommendations
  const recommendations = [];
  if (fakeProbability > 60) {
    recommendations.push('Do not share this content without independent verification.');
    recommendations.push('Cross-reference with AP News, Reuters, or BBC.');
  }
  if (sourceRep < 40) {
    recommendations.push('Be cautious of this source — it has low credibility indicators.');
  }
  if (biasDetection?.propagandaTechniques?.length > 0) {
    recommendations.push('Be aware of emotional manipulation techniques in this article.');
  }
  if (aiProb > 60) {
    recommendations.push('This content may be AI-generated. Verify authorship independently.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Content appears largely reliable. Always verify important claims independently.');
  }

  return {
    fakeProbability: Math.min(100, Math.max(0, fakeProbability)),
    trustScore: Math.min(100, Math.max(0, trustScore)),
    finalVerdict,
    explanation,
    recommendations,
  };
}

module.exports = { judge };
