const agentConfig = require('../config/agents');
const { callAnakinWorkflow } = require('./anakinClient');

// AI content linguistic patterns
const AI_PATTERNS = {
  // Overly structured transitions
  transitions: [/firstly/gi, /secondly/gi, /thirdly/gi, /in conclusion/gi, /furthermore/gi, /moreover/gi, /additionally/gi, /it is worth noting/gi, /it is important to note/gi],
  // Hedging phrases common in AI text
  hedging: [/it is possible that/gi, /one might argue/gi, /some may suggest/gi, /in many ways/gi, /to some extent/gi, /as previously mentioned/gi],
  // Generic filler phrases
  fillers: [/in today\'s world/gi, /in today\'s society/gi, /throughout history/gi, /it goes without saying/gi, /needless to say/gi],
  // Overly balanced language
  balance: [/on one hand.*on the other hand/gis, /while some.*others/gi, /pros and cons/gi],
};

/**
 * Agent 5: AI-Generated Content Detection
 * - Analyzes linguistic patterns
 * - Detects repetitive structures
 * - Estimates probability of AI generation
 */
async function detect(extractedText) {
  const workflowResult = await callAnakinWorkflow(
    agentConfig.workflows.aiContentDetection,
    { extractedText }
  );

  if (workflowResult) return workflowResult;

  return analyzeLocally(extractedText);
}

function analyzeLocally(text) {
  if (!text || text.length < 50) {
    return { aiGeneratedProbability: 0, patterns: [], confidence: 'Low' };
  }

  const detectedPatterns = [];
  let score = 0;

  // Check each pattern category
  let transitionHits = AI_PATTERNS.transitions.filter(p => p.test(text)).length;
  let hedgingHits = AI_PATTERNS.hedging.filter(p => p.test(text)).length;
  let fillerHits = AI_PATTERNS.fillers.filter(p => p.test(text)).length;
  let balanceHits = AI_PATTERNS.balance.filter(p => p.test(text)).length;

  if (transitionHits >= 2) {
    detectedPatterns.push('Overly structured transitions');
    score += transitionHits * 8;
  }
  if (hedgingHits >= 2) {
    detectedPatterns.push('Excessive hedging language');
    score += hedgingHits * 10;
  }
  if (fillerHits >= 1) {
    detectedPatterns.push('Generic filler phrases detected');
    score += fillerHits * 12;
  }
  if (balanceHits >= 1) {
    detectedPatterns.push('Templated balanced argumentation');
    score += balanceHits * 8;
  }

  // Sentence length consistency (AI tends to be very uniform)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length > 3) {
    const lengths = sentences.map(s => s.trim().split(' ').length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Low standard deviation means very uniform sentences (AI-like)
    if (stdDev < 5 && sentences.length > 5) {
      detectedPatterns.push('Unnaturally uniform sentence lengths');
      score += 20;
    }
  }

  // Perplexity approximation: unusually formal vocabulary
  const formalWords = (text.match(/\b(utilize|leverage|facilitate|implement|ascertain|endeavor|demonstrate|subsequently|consequently|furthermore|nevertheless)\b/gi) || []).length;
  if (formalWords > 3) {
    detectedPatterns.push('High density of formal/AI vocabulary');
    score += formalWords * 3;
  }

  // Repetitive paragraph structure
  const paragraphs = text.split('\n\n');
  if (paragraphs.length > 2) {
    const starterWords = paragraphs.map(p => p.trim().split(' ')[0]?.toLowerCase()).filter(Boolean);
    const uniqueStarters = new Set(starterWords).size;
    if (uniqueStarters / starterWords.length < 0.5) {
      detectedPatterns.push('Repetitive paragraph structure');
      score += 15;
    }
  }

  const aiGeneratedProbability = Math.min(95, Math.max(2, score));
  const confidence = aiGeneratedProbability > 60 ? 'High' : aiGeneratedProbability > 35 ? 'Medium' : 'Low';

  return {
    aiGeneratedProbability,
    patterns: detectedPatterns,
    confidence,
  };
}

module.exports = { detect };
