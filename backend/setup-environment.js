const fs = require('fs');
const path = require('path');

const envLocal = path.resolve(__dirname, '.env.local');
const env = path.resolve(__dirname, '.env');

if (!fs.existsSync(envLocal) && !fs.existsSync(env)) {
  console.warn('⚠️  No .env or .env.local found. Using default environment values.');
}

console.log('✅ Environment setup complete');
