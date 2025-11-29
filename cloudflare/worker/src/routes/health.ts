import { Hono } from 'hono';
import type { AppEnv } from '../types.js';

const serviceStartedAt = Date.now();

export const healthRouter = new Hono<AppEnv>();

healthRouter.get('/', async (c) => {
    const { DB, CACHE } = c.env;

    const checks = {
        service: 'operational' as const,
        uptimeMs: Date.now() - serviceStartedAt,
        timestamp: new Date().toISOString(),
        database: 'not-configured' as 'ok' | 'degraded' | 'failed' | 'not-configured',
        cache: 'not-configured' as 'ok' | 'degraded' | 'failed' | 'not-configured',
    };

    if (DB) {
        try {
            await DB.prepare('SELECT 1 as ok').first();
            checks.database = 'ok';
        } catch (error) {
            checks.database = 'failed';
            return c.json(
                {
                    status: 'error',
                    checks,
                    reason: 'Database connectivity failed',
                    error: error instanceof Error ? error.message : String(error),
                },
                503,
            );
        }
    }

    if (CACHE) {
        try {
            const probeKey = `health-check:${crypto.randomUUID()}`;
            await CACHE.put(probeKey, 'ok', { expirationTtl: 30 });
            const value = await CACHE.get(probeKey);
            if (value) {
                checks.cache = 'ok';
            } else {
                checks.cache = 'degraded';
            }
            await CACHE.delete(probeKey);
        } catch (error) {
            checks.cache = 'failed';
            return c.json(
                {
                    status: 'error',
                    checks,
                    reason: 'Cache connectivity failed',
                    error: error instanceof Error ? error.message : String(error),
                },
                503,
            );
        }
    }

    return c.json({ status: 'ok', checks });
});
