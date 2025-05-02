module.exports = {
  // Disable MCP mode
  useMCP: false,

  // API configuration
  api: {
    // Use OpenRouter API key instead of Anthropic
    openRouterApiKey: process.env.OPENROUTER_API_KEY || "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",
    model: process.env.MODEL || "anthropic/claude-3-7-sonnet-20250219",
    maxTokens: parseInt(process.env.MAX_TOKENS || "64000"),
    temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
  },

  // Task defaults
  defaults: {
    subtasks: parseInt(process.env.DEFAULT_SUBTASKS || "5"),
    priority: process.env.DEFAULT_PRIORITY || "medium",
  },

  // Project configuration
  project: {
    tasksFile: "./taskmaster.json",
    readmeFile: "./README.md",
  }
};
