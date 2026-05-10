const axios = require('axios');
const agentConfig = require('../config/agents');

/**
 * Base function to call an Anakin AI workflow
 */
async function callAnakinWorkflow(workflowId, inputs) {
  if (!workflowId || agentConfig.mockMode) {
    return null; // Caller handles mock fallback
  }

  try {
    const response = await axios.post(
      `${agentConfig.baseUrl}/workflows/${workflowId}/run`,
      { inputs },
      {
        headers: {
          'Authorization': `Bearer ${agentConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    return response.data?.outputs || response.data;
  } catch (error) {
    console.error(`[Anakin] Workflow ${workflowId} error:`, error.message);
    return null;
  }
}

module.exports = { callAnakinWorkflow };
