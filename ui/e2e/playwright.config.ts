import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    cwd: '..',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
})
