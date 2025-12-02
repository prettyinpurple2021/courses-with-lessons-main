#!/usr/bin/env node
/**
 * Cross-platform build script that ensures TypeScript is available
 * Usage: node scripts/build.js [mode]
 * Example: node scripts/build.js analyze
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get optional mode from command line arguments
const mode = process.argv[2];
const viteModeArg = mode ? `--mode ${mode}` : '';

// Check for TypeScript binary
const tscPath = join(rootDir, 'node_modules', '.bin', 'tsc');
const tscPathWin = tscPath + '.cmd'; // Windows

// Verify TypeScript binary exists
if (!existsSync(tscPath) && !existsSync(tscPathWin)) {
  console.error('Error: TypeScript binary not found.');
  console.error('Please ensure TypeScript is installed: npm install');
  process.exit(1);
}

// Use npx for cross-platform compatibility (handles Windows .cmd files automatically)
// Fallback to direct path if npx doesn't work
let tscCommand = 'npx tsc';

try {
  execSync('npx --version', { stdio: 'pipe', cwd: rootDir });
} catch {
  // Fallback to direct path
  if (process.platform === 'win32' && existsSync(tscPathWin)) {
    tscCommand = `node "${tscPathWin}"`;
  } else if (existsSync(tscPath)) {
    tscCommand = `node "${tscPath}"`;
  } else {
    console.error('Error: TypeScript binary not found and npx is not available.');
    process.exit(1);
  }
}

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

