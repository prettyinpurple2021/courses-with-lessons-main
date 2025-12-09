import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../../routes/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth API Integration Tests', () => {
  let app: Express;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';

  beforeAll(async () => {
    // Setup express app with auth routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Clean up any existing test user
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'test-',
          },
        },
      });
    } catch (error) {
      // Ignore errors if no users to delete
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await prisma.user.deleteMany({
        where: {
          email: testEmail,
        },
      });
    } catch (error) {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.accessToken).toBeDefined();
      // Refresh token is in cookie, not body
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken/);
    });

    it('should reject registration with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(409); // Expect Conflict for failing unique constraint
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: `new-${testEmail}`,
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.accessToken).toBeDefined();
      // Refresh token is in cookie, not body
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken/);
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
