import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    MAIN_API_URL: 'http://localhost:1337/api',
    TEST_USER_EMAIL: 'test@test.com',
    TEST_USER_PASSWORD: 'test'
  },
  chromeWebSecurity: false,
  defaultCommandTimeout: 20000
});
