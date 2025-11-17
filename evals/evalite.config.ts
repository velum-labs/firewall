import { defineConfig } from "evalite/config";

export default defineConfig({
  setupFiles: ["dotenv/config"],
  testTimeout: 60_000, // 60 seconds
  maxConcurrency: 100, // Run up to 100 tests in parallel
  scoreThreshold: 80, // Fail if average score < 80
  hideTable: false,
  server: {
    port: 3006,
  },
});
