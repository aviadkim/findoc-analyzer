import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "https://findoc-deploy.ey.r.appspot.com",
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true
    },
  },
  testPattern: "**/*.test.ts",
  ai: {
    provider: "deepseek",
    apiKey: "sk-2c3e7a2a9e5c4a9e9e9e9e9e9e9e9e9e"
  },
} satisfies ShortestConfig;
