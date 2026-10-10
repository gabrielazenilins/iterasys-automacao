// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  // Plataforma real: poucas execuções e sem paralelismo, para evitar bloqueio de conta
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://iterasys.learnworlds.com',
    // Trace e vídeo desligados: podem registrar o que foi digitado e cookies da sessão
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
  },
  // Cada projeto repete todos os testes em um navegador. Como é a plataforma real,
  // use --project=<nome> para rodar só um (os scripts do package.json já fazem isso).
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
