#!/usr/bin/env tsx
/**
 * Check for Duplicate Video IDs
 * 
 * Simple script to verify no duplicate video IDs exist in update-lesson-videos.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'scripts', 'update-lesson-videos.ts');
const content = readFileSync(filePath, 'utf-8');

// Extract all video IDs using regex
const videoIdPattern = /'([A-Za-z0-9_-]{11})',/g;
const matches = [...content.matchAll(videoIdPattern)];
const videoIds = matches.map(m => m[1]);

// Find duplicates
const duplicates = new Map<string, number[]>();
videoIds.forEach((id, index) => {
  if (!duplicates.has(id)) {
    const positions = videoIds.map((v, i) => v === id ? i : -1).filter(i => i !== -1);
    if (positions.length > 1) {
      duplicates.set(id, positions);
    }
  }
});

if (duplicates.size === 0) {
  console.log('✅ No duplicate video IDs found!');
  process.exit(0);
} else {
  console.log(`❌ Found ${duplicates.size} duplicate video ID(s):\n`);
  
  for (const [videoId, positions] of duplicates.entries()) {
    console.log(`Video ID: ${videoId}`);
    console.log(`  Appears ${positions.length} times at positions: ${positions.join(', ')}`);
    
    // Find which courses/lessons these belong to
    const lines = content.split('\n');
    positions.forEach(pos => {
      const lineNum = matches[pos].index;
      const lineIndex = content.substring(0, lineNum).split('\n').length;
      const line = lines[lineIndex - 1]?.trim();
      if (line) {
        console.log(`    Line ${lineIndex}: ${line.substring(0, 80)}...`);
      }
    });
    console.log('');
  }
  
  process.exit(1);
}




