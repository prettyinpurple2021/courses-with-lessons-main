import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle/migrations',
    driver: 'd1',
    dbCredentials: {
        wranglerConfigPath: './wrangler.env.toml',
        databaseId: 'DB',
    },
});
