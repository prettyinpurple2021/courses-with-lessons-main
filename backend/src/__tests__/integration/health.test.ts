import request from 'supertest';
import app from '../../server.js';
import { closeRedis } from '../../config/redis.js';

describe('Integration Tests: Health Check', () => {
    afterAll(async () => {
        // Close redis connection after tests to prevent open handle
        await closeRedis();
    });

    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});
