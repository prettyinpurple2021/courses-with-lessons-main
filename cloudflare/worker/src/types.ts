import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

export type AppBindings = {
    DB: D1Database;
    CACHE?: KVNamespace;
    FILES?: R2Bucket;
};

export type AppVariables = {
    requestId: string;
    userId: string;
};

export type AppEnv = {
    Bindings: Partial<AppBindings>;
    Variables: AppVariables;
};
