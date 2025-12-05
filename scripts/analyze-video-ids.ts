#!/usr/bin/env tsx
/**
 * Analyze Video IDs Script
 * 
 * Checks for duplicates and identifies placeholder video IDs
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'scripts', 'update-lesson-videos.ts');
const content = readFileSync(filePath, 'utf-8');

// Extract all video IDs
const videoIdPattern = /'([A-Za-z0-9_-]{11})',/g;
const matches = [...content.matchAll(videoIdPattern)];
const videoIds = matches.map(m => ({ id: m[1], line: content.substring(0, m.index).split('\n').length }));

// Find duplicates
const duplicates = new Map<string, number[]>();
videoIds.forEach(({ id, line }) => {
  const occurrences = videoIds.filter(v => v.id === id).map(v => v.line);
  if (occurrences.length > 1 && !duplicates.has(id)) {
    duplicates.set(id, occurrences);
  }
});

// Identify placeholder patterns (systematic patterns that don't look like real YouTube IDs)
const placeholderPattern = /^[A-Z][0-9]h[0-9]gqyKJQ[a-z]$/;
const placeholders = videoIds.filter(({ id }) => placeholderPattern.test(id));

console.log('📊 Video ID Analysis\n');
console.log('='.repeat(70));

if (duplicates.size > 0) {
  console.log('\n❌ DUPLICATE VIDEO IDs FOUND:\n');
  duplicates.forEach((lines, id) => {
    console.log(`  Video ID: ${id}`);
    console.log(`  Appears on lines: ${lines.join(', ')}\n`);
  });
} else {
  console.log('\n✅ No duplicate video IDs found!\n');
}

if (placeholders.length > 0) {
  console.log(`\n⚠️  PLACEHOLDER VIDEO IDs FOUND: ${placeholders.length}\n`);
  
  // Group by course
  const coursePlaceholders: Record<number, typeof placeholders> = {};
  placeholders.forEach(({ id, line }) => {
    // Determine course based on line number
    let course = 1;
    if (line > 40 && line <= 55) course = 2;
    else if (line > 55 && line <= 69) course = 3;
    else if (line > 69 && line <= 83) course = 4;
    else if (line > 83 && line <= 97) course = 5;
    else if (line > 97 && line <= 111) course = 6;
    else if (line > 111 && line <= 125) course = 7;
    
    if (!coursePlaceholders[course]) coursePlaceholders[course] = [];
    coursePlaceholders[course].push({ id, line });
  });
  
  Object.entries(coursePlaceholders).forEach(([course, ids]) => {
    console.log(`  Course ${course}: ${ids.length} placeholders`);
    ids.forEach(({ id, line }) => {
      console.log(`    Line ${line}: ${id}`);
    });
  });
  console.log();
} else {
  console.log('\n✅ No placeholder video IDs found!\n');
}

console.log('='.repeat(70));
console.log(`\nTotal video IDs: ${videoIds.length}`);
console.log(`Unique video IDs: ${new Set(videoIds.map(v => v.id)).size}`);

