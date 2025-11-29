import { Hono } from 'hono';
import { healthRouter } from './routes/health.js';
import { dashboardRouter } from './routes/dashboard.js';
import { coursesRouter } from './routes/courses.js';
import type { AppEnv } from './types.js';

const app = new Hono<AppEnv>();

app.route('/api/health', healthRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/courses', coursesRouter);

app.notFound((c) =>
    c.json(
        {
            status: 'error',
            message: 'Endpoint not found',
        },
        404,
    ),
);

export default app;
