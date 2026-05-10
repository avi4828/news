const agentConfig = require('../config/agents');
const { callAnakinWorkflow } = require('./anakinClient');

// Propaganda and manipulation indicators
const PROPAGANDA_TECHNIQUES = {
  'Appeal to Fear': [/threat/gi, /danger/gi, /deadly/gi, /terrifying/gi, /catastrophic/gi, /crisis/gi],
  'Loaded Language': [/radical/gi, /extremist/gi, /corrupt/gi, /evil/gi, /destroy/gi, /invasion/gi],
  'Bandwagon': [/everyone knows/gi, /all true patriots/gi, /people are waking up/gi],
  'False Dichotomy': [/either.*or/gi, /you\'re either with us/gi, /if you\'re not/gi],
  'Name Calling': [/fake news/gi, /liar/gi, /traitor/gi, /puppet/gi, /shill/gi],
  'Glittering Generalities': [/freedom/gi, /democracy/gi, /patriot/gi, /truth/gi, /justice/gi],
  'Card Stacking': [/anonymous sources/gi, /whistleblower/gi, /classified documents/gi],
  'Scapegoating': [/\bthey\b.*are responsible/gi, /globalists/gi, /deep state/gi, /cabal/gi],
};

const EMOTIONAL_WORDS = {
  negative: [/shocking/gi, /outrageous/gi, /scandalous/gi, /unbelievable/gi, /disgusting/gi, /horrifying/gi, /betrayal/gi, /conspiracy/gi, /exposed/gi, /cover-?up/gi],
  positive: [/amazing/gi, /incredible/gi, /miraculous/gi, /breakthrough/gi, /revolutionary/gi, /100%/gi, /guaranteed/gi, /proven/gi],
  urgency: [/immediately/gi, /share now/gi, /before it gets deleted/gi, /urgent/gi, /breaking/gi, /act now/gi, /limited time/gi],
};

const POLITICAL_SIGNALS = {
  'Left-Leaning': [/progressive/gi, /social justice/gi, /inequality/gi, /climate change/gi, /systemic racism/gi],
  'Right-Leaning': [/deep state/gi, /mainstream media/gi, /globalist/gi, /radical left/gi, /border security/gi, /election fraud/gi],
};

/**
 * Agent 4: Bias Detection
 * - Detects propaganda techniques
 * - Scores emotional manipulation
 * - Estimates political leaning
 * - Computes overall bias score
 */
async function detect(extractedText) {
  const workflowResult = await callAnakinWorkflow(
    agentConfig.workflows.biasDetection,
    { extractedText }
  );

  if (workflowResult) return workflowResult;

  return analyzeLocally(extractedText);
}

function analyzeLocally(text) {
  const detectedTechniques = [];
  let propagandaHits = 0;

  // Check propaganda techniques
  for (const [technique, patterns] of Object.entries(PROPAGANDA_TECHNIQUES)) {
    const hits = patterns.filter(p => p.test(text)).length;
    if (hits > 0) {
      detectedTechniques.push(technique);
      propagandaHits += hits;
    }
  }

  // Check emotional manipulation
  let emotionalHits = 0;
  const urgencyHits = EMOTIONAL_WORDS.urgency.filter(p => p.test(text)).length;
  emotionalHits += EMOTIONAL_WORDS.negative.filter(p => p.test(text)).length;
  emotionalHits += EMOTIONAL_WORDS.positive.filter(p => p.test(text)).length;
  emotionalHits += urgencyHits * 2; // Urgency is weighted more

  // Check political leaning
  let politicalLeaning = 'Neutral';
  let leftScore = 0, rightScore = 0;
  POLITICAL_SIGNALS['Left-Leaning'].forEach(p => { if (p.test(text)) leftScore++; });
  POLITICAL_SIGNALS['Right-Leaning'].forEach(p => { if (p.test(text)) rightScore++; });
  if (leftScore > rightScore + 1) politicalLeaning = 'Left-Leaning';
  else if (rightScore > leftScore + 1) politicalLeaning = 'Right-Leaning';
  else if (leftScore > 0 || rightScore > 0) politicalLeaning = 'Slightly Biased';

  // Sentiment score approximation (-1 to 1)
  const negWords = text.match(/\b(bad|terrible|awful|dangerous|wrong|fail|corrupt|evil|lie|fake)\b/gi)?.length || 0;
  const posWords = text.match(/\b(good|great|amazing|excellent|success|truth|real|proven|safe|free)\b/gi)?.length || 0;
  const totalWords = text.split(' ').length;
  const sentimentScore = Math.max(-1, Math.min(1, (posWords - negWords) / (totalWords * 0.05 + 1)));

  // Compute bias score (0–100)
  const propagandaScore = Math.min(40, propagandaHits * 8);
  const emotionalScore = Math.min(40, emotionalHits * 6);
  const urgencyScore = Math.min(20, urgencyHits * 10);
  let biasScore = propagandaScore + emotionalScore + urgencyScore;
  biasScore = Math.min(100, Math.max(0, biasScore));

  let biasLevel;
  if (biasScore < 20) biasLevel = 'None';
  else if (biasScore < 40) biasLevel = 'Low';
  else if (biasScore < 60) biasLevel = 'Moderate';
  else if (biasScore < 80) biasLevel = 'High';
  else biasLevel = 'Extreme';

  return {
    biasScore,
    biasLevel,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    propagandaTechniques: detectedTechniques,
    politicalLeaning,
    emotionalManipulationScore: emotionalScore,
    urgencyManipulation: urgencyHits > 0,
  };
}

module.exports = { detect };
