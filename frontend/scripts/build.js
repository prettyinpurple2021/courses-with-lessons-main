#!/usr/bin/env node
/**
 * Cross-platform build script that ensures TypeScript is available
 * Usage: node scripts/build.js [mode]
 * Example: node scripts/build.js analyze
 */
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get optional mode from command line arguments
const mode = process.argv[2];
const viteModeArg = mode ? `--mode ${mode}` : '';

// Use npx for cross-platform compatibility (handles Windows .cmd files automatically)
// npx will find TypeScript regardless of where it's installed (workspace hoisting)
// It searches node_modules/.bin in current directory and parent directories
const tscCommand = 'npx tsc';

try {
  console.log('Running TypeScript compiler...');
  execSync(tscCommand, { stdio: 'inherit', cwd: rootDir });
  
  console.log(`Running Vite build${mode ? ` in ${mode} mode` : ''}...`);
  const viteCommand = `npx vite build ${viteModeArg}`.trim();
  execSync(viteCommand, { stdio: 'inherit', cwd: rootDir });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

