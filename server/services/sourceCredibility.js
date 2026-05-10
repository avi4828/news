const agentConfig = require('../config/agents');
const { callAnakinWorkflow } = require('./anakinClient');

// Known credible domains
const TRUSTED_DOMAINS = [
  'reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com', 'theguardian.com',
  'washingtonpost.com', 'npr.org', 'pbs.org', 'nature.com', 'sciencemag.org',
  'who.int', 'cdc.gov', 'nih.gov', 'snopes.com', 'factcheck.org',
];

// Known suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /[a-z0-9]+-news\d+/i, /truth\w+news/i, /real\w+report/i,
  /\w+buzz\w*/i, /daily\w+wire\w*/i, /patriot\w+/i,
];

/**
 * Agent 3: Source Credibility
 * - Analyzes the domain of the source URL
 * - Checks against known credible/suspicious lists
 * - Returns trust score
 */
async function analyze(sourceURL) {
  const workflowResult = await callAnakinWorkflow(
    agentConfig.workflows.sourceCredibility,
    { sourceURL }
  );

  if (workflowResult) return workflowResult;

  return analyzeLocally(sourceURL);
}

function analyzeLocally(sourceURL) {
  if (!sourceURL) {
    return {
      sourceReputationScore: 40,
      domain: 'Unknown',
      domainFlags: ['No source URL provided'],
      trustTier: 'Unknown',
      domainAge: null,
    };
  }

  let domain = 'unknown';
  try {
    const url = new URL(sourceURL.startsWith('http') ? sourceURL : `https://${sourceURL}`);
    domain = url.hostname.replace('www.', '').toLowerCase();
  } catch {
    domain = sourceURL.toLowerCase();
  }

  const flags = [];
  let score = 50; // Neutral baseline

  // Trusted domain boost
  if (TRUSTED_DOMAINS.some(d => domain.includes(d))) {
    score = 92;
    flags.push('✅ Recognized credible news source');
  }

  // Suspicious pattern penalty
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(domain)) {
      score -= 30;
      flags.push(`⚠️ Domain pattern matches known misinformation sites`);
    }
  });

  // HTTPS check
  if (sourceURL.startsWith('http://')) {
    score -= 10;
    flags.push('⚠️ Non-HTTPS source (insecure)');
  }

  // Short domain length (legit sites tend to have shorter names)
  if (domain.length > 30) {
    score -= 10;
    flags.push('⚠️ Unusually long domain name');
  }

  // Has numbers in domain name (often suspicious)
  if (/\d/.test(domain.split('.')[0])) {
    score -= 15;
    flags.push('⚠️ Domain contains numbers (suspicious pattern)');
  }

  score = Math.max(0, Math.min(100, score));

  let trustTier;
  if (score >= 80) trustTier = 'Highly Trusted';
  else if (score >= 60) trustTier = 'Moderately Trusted';
  else if (score >= 40) trustTier = 'Low Trust';
  else trustTier = 'Untrusted / Suspicious';

  return {
    sourceReputationScore: score,
    domain,
    domainFlags: flags.length ? flags : ['No specific issues detected'],
    trustTier,
    domainAge: null,
  };
}

module.exports = { analyze };
