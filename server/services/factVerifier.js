const axios = require('axios');
const agentConfig = require('../config/agents');
const { callAnakinWorkflow } = require('./anakinClient');

/**
 * Agent 2: Fact Verification
 * - Extracts key claims from text
 * - Searches Tavily for each claim
 * - Computes fact match confidence score
 */
async function verify(extractedText, source) {
  const workflowResult = await callAnakinWorkflow(
    agentConfig.workflows.factVerification,
    { extractedText, source }
  );

  if (workflowResult) return workflowResult;

  // Fallback: Tavily direct search
  if (agentConfig.tavilyApiKey) {
    try {
      return await verifyWithTavily(extractedText);
    } catch (e) {
      console.error('[FactVerifier] Tavily error:', e.message);
    }
  }

  return getMockFactVerification(extractedText);
}

async function verifyWithTavily(text) {
  // Extract simple claims (first 3 sentences)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const claims = sentences.slice(0, 3).map(s => s.trim());

  const results = await Promise.all(
    claims.map(async (claim) => {
      try {
        const response = await axios.post(
          'https://api.tavily.com/search',
          {
            api_key: agentConfig.tavilyApiKey,
            query: claim,
            search_depth: 'basic',
            max_results: 3,
          },
          { timeout: 10000 }
        );
        const hasResults = response.data?.results?.length > 0;
        const topResult = response.data?.results?.[0];
        
        let isVerified = false;
        if (hasResults && topResult?.score > 0.7) {
          isVerified = true;
          // If the top result is a fact-check debunking the claim, it's NOT verified
          const resultText = ((topResult.title || '') + ' ' + (topResult.content || '')).toLowerCase();
          if (/fake|hoax|false|debunk|satire|misinformation/.test(resultText)) {
            isVerified = false;
          }
        }

        return {
          claim,
          verified: isVerified,
          confidence: hasResults ? Math.round(topResult.score * 100) : 20,
          sources: response.data?.results?.slice(0, 2).map(r => r.url) || [],
        };
      } catch {
        return { claim, verified: false, confidence: 0, sources: [] };
      }
    })
  );

  const verifiedCount = results.filter(r => r.verified).length;
  const factMatchScore = claims.length > 0 ? Math.round((verifiedCount / claims.length) * 100) : 30;

  return {
    claims: results,
    factMatchScore,
    verifiedClaims: results.filter(r => r.verified),
    unverifiedClaims: results.filter(r => !r.verified),
  };
}

function getMockFactVerification(text) {
  const fakeClaims = [
    { claim: 'Cancer can be cured in 7 days with herbs', verified: false, confidence: 5, sources: [] },
    { claim: 'FDA suppresses cancer cures', verified: false, confidence: 12, sources: [] },
    { claim: 'Anonymous sources confirm pharmaceutical conspiracy', verified: false, confidence: 8, sources: [] },
    { claim: 'Unreported trials show 100% success', verified: false, confidence: 3, sources: [] },
  ];

  return {
    claims: fakeClaims,
    factMatchScore: 22,
    verifiedClaims: [],
    unverifiedClaims: fakeClaims,
  };
}

module.exports = { verify };
