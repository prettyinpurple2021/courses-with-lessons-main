import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema.js';

export const getDb = (db: D1Database) => drizzle(db, { schema });

export type Database = ReturnType<typeof getDb>;
export type Schema = typeof schema;
