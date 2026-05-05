import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 15000,
    setupNodeEvents(on, config) {
      // allow adding custom environment variables from process.env if needed
      config.env = config.env || {}
      if (process.env.TEST_USER_EMAIL) config.env.TEST_USER_EMAIL = process.env.TEST_USER_EMAIL
      if (process.env.TEST_USER_PASSWORD) config.env.TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD
      if (process.env.INTERCEPT_AUTH) config.env.INTERCEPT_AUTH = process.env.INTERCEPT_AUTH
      return config
    },
  },
  video: false,
})
