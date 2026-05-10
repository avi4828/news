/**
 * Anakin AI Workflow Configuration
 * -----------------------------------------------
 * Paste your Anakin Workflow IDs in the .env file:
 *
 *   ANAKIN_WORKFLOW_CONTENT_EXTRACTION=wf_xxxxxxxx
 *   ANAKIN_WORKFLOW_FACT_VERIFICATION=wf_xxxxxxxx
 *   ANAKIN_WORKFLOW_SOURCE_CREDIBILITY=wf_xxxxxxxx
 *   ANAKIN_WORKFLOW_BIAS_DETECTION=wf_xxxxxxxx
 *   ANAKIN_WORKFLOW_AI_CONTENT_DETECTION=wf_xxxxxxxx
 *   ANAKIN_WORKFLOW_FINAL_JUDGE=wf_xxxxxxxx
 *
 * Workflow Input/Output contracts are documented below.
 * -----------------------------------------------
 */

module.exports = {
  baseUrl: process.env.ANAKIN_BASE_URL || 'https://api.anakin.ai/v1',
  apiKey: process.env.ANAKIN_API_KEY,
  mockMode: process.env.MOCK_MODE === 'true',

  workflows: {
    /**
     * Agent 1: Content Extraction
     * Input:  { url?, rawText?, imageBase64? }
     * Output: { extractedText, title, publishedDate, author, wordCount }
     */
    contentExtraction: process.env.ANAKIN_WORKFLOW_CONTENT_EXTRACTION,

    /**
     * Agent 2: Fact Verification
     * Input:  { extractedText, claims[] }
     * Output: { claims[], factMatchScore (0-100), verifiedClaims[], unverifiedClaims[] }
     */
    factVerification: process.env.ANAKIN_WORKFLOW_FACT_VERIFICATION,

    /**
     * Agent 3: Source Credibility
     * Input:  { sourceURL, domain }
     * Output: { sourceReputationScore (0-100), domainAge, domainFlags[], trustTier }
     */
    sourceCredibility: process.env.ANAKIN_WORKFLOW_SOURCE_CREDIBILITY,

    /**
     * Agent 4: Bias Detection
     * Input:  { extractedText }
     * Output: { biasScore (0-100), biasLevel, sentimentScore (-1 to 1), propagandaTechniques[], politicalLeaning }
     */
    biasDetection: process.env.ANAKIN_WORKFLOW_BIAS_DETECTION,

    /**
     * Agent 5: AI Content Detection
     * Input:  { extractedText }
     * Output: { aiGeneratedProbability (0-100), patterns[], confidence }
     */
    aiContentDetection: process.env.ANAKIN_WORKFLOW_AI_CONTENT_DETECTION,

    /**
     * Agent 6: Final Judge
     * Input:  { all previous agent outputs }
     * Output: { fakeProbability, trustScore, finalVerdict, explanation, recommendations[] }
     */
    finalJudge: process.env.ANAKIN_WORKFLOW_FINAL_JUDGE,
  },

  tavilyApiKey: process.env.TAVILY_API_KEY,
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
};
