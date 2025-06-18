import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "tests/e2e/support/e2e.js",
    specPattern: "tests/e2e/specs/**/*.cy.js",
    videosFolder: "tests/e2e/videos",
    screenshotsFolder: "tests/e2e/screenshots",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshot: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: "http://localhost:8000",
    },
  },
})
