const axios = require('axios');
const agentConfig = require('../config/agents');
const { callAnakinWorkflow } = require('./anakinClient');

/**
 * Agent 1: Content Extraction
 * - For URLs: uses Firecrawl API
 * - For images: uses OCR simulation
 * - For text: cleans and returns directly
 */
async function extract(input) {
  const workflowResult = await callAnakinWorkflow(
    agentConfig.workflows.contentExtraction,
    input
  );

  if (workflowResult) return workflowResult;

  // ── Fallback: Direct API calls ──────────────────────────────
  if (input.type === 'url' && agentConfig.firecrawlApiKey) {
    try {
      const response = await axios.post(
        'https://api.firecrawl.dev/v0/scrape',
        { url: input.url, pageOptions: { onlyMainContent: true } },
        { headers: { Authorization: `Bearer ${agentConfig.firecrawlApiKey}` }, timeout: 15000 }
      );
      return {
        extractedText: response.data?.data?.content || '',
        title: response.data?.data?.metadata?.title || 'Unknown',
        author: response.data?.data?.metadata?.author || 'Unknown',
        publishedDate: response.data?.data?.metadata?.publishedDate,
        wordCount: (response.data?.data?.content || '').split(' ').length,
      };
    } catch (e) {
      console.error('[ContentExtractor] Firecrawl error:', e.message);
    }
  }

  if (input.type === 'text') {
    const cleaned = input.text.replace(/\s+/g, ' ').trim();
    return {
      extractedText: cleaned,
      title: cleaned.split('.')[0].slice(0, 80) + '...',
      author: 'Unknown',
      wordCount: cleaned.split(' ').length,
    };
  }

  // Mock fallback for any type
  return getMockExtraction(input);
}

function getMockExtraction(input) {
  const mockTexts = {
    url: `Breaking: Scientists have discovered that consuming a specific combination of herbs can cure all types of cancer in just 7 days. The pharmaceutical industry has been suppressing this information for decades to protect their profits. Multiple anonymous sources within the FDA have confirmed this suppression. The treatment, developed by rogue scientists working underground, has shown 100% success rates in unreported trials.`,
    text: input.text || 'Sample article text for analysis.',
    image: `BREAKING NEWS: GOVERNMENT ANNOUNCES FREE PETROL FOR EVERYONE. PM: "NO MORE PETROL PRICES FROM TOMORROW". Historic decision by central government. Petrol and diesel will be completely free for 6 months. GOVERNMENT TO BEAR ALL FUEL COSTS.`,
  };

  const text = mockTexts[input.type] || mockTexts.url;
  return {
    extractedText: text,
    title: input.type === 'url' ? `Analysis of: ${input.url}` : 'Submitted Content Analysis',
    author: 'Unknown',
    publishedDate: null,
    wordCount: text.split(' ').length,
    source: input.url || null,
  };
}

module.exports = { extract };
