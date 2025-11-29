#!/usr/bin/env node

/**
 * Database backup script
 * 
 * Usage:
 *   npm run backup:db
 * 
 * Environment variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   BACKUP_DIR - Directory to store backups (default: ./backups)
 *   BACKUP_RETENTION_DAYS - Number of days to keep backups (default: 30)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdir, readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Create backup directory if it doesn't exist
 */
async function ensureBackupDir() {
  try {
    await mkdir(BACKUP_DIR, { recursive: true });
    console.log(`Backup directory: ${BACKUP_DIR}`);
  } catch (error) {
    console.error('Failed to create backup directory:', error);
    throw error;
  }
}

/**
 * Generate backup filename with timestamp
 */
function getBackupFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `backup-${timestamp}.sql`;
}

/**
 * Perform database backup using pg_dump
 */
async function backupDatabase() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const filename = getBackupFilename();
  const filepath = join(BACKUP_DIR, filename);

  console.log(`Starting database backup to ${filepath}...`);

  try {
    const { stderr } = await execAsync(
      `pg_dump "${DATABASE_URL}" > "${filepath}"`
    );

    if (stderr) {
      console.warn('Backup warnings:', stderr);
    }

    console.log(`✓ Database backup completed: ${filename}`);
    return filepath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

/**
 * Clean up old backups based on retention policy
 */
async function cleanupOldBackups() {
  console.log(`Cleaning up backups older than ${RETENTION_DAYS} days...`);

  try {
    const files = await readdir(BACKUP_DIR);
    const now = Date.now();
    const maxAge = RETENTION_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('backup-') || !file.endsWith('.sql')) {
        continue;
      }

      const filepath = join(BACKUP_DIR, file);
      const stats = await stat(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        await unlink(filepath);
        console.log(`  Deleted old backup: ${file}`);
        deletedCount++;
      }
    }

    console.log(`✓ Cleanup completed. Deleted ${deletedCount} old backup(s)`);
  } catch (error) {
    console.error('Cleanup failed:', error);
    // Don't throw - cleanup failure shouldn't fail the backup
  }
}

/**
 * Main backup function
 */
async function main() {
  try {
    console.log('=== Database Backup Script ===\n');

    await ensureBackupDir();
    await backupDatabase();
    await cleanupOldBackups();

    console.log('\n=== Backup completed successfully ===');
    process.exit(0);
  } catch (error) {
    console.error('\n=== Backup failed ===');
    console.error(error);
    process.exit(1);
  }
}

// Run the backup
main();
