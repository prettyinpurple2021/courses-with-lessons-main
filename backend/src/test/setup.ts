import { jest, beforeAll, afterAll } from '@jest/globals';
// Global test setup for backend tests
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
// Mock Redis client
jest.mock('../config/redis', () => ({
    redisClient: {
        connect: jest.fn().mockResolvedValue(true),
        on: jest.fn(),
        quit: jest.fn().mockResolvedValue(true),
        sendCommand: jest.fn(),
        isOpen: true,
    },
    initRedis: jest.fn().mockResolvedValue(true),
    getRedisClient: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(true),
        on: jest.fn(),
        quit: jest.fn().mockResolvedValue(true),
        sendCommand: jest.fn(),
    }),
    closeRedis: jest.fn().mockResolvedValue(true),
}));

// Mock rate-limit-redis to avoid Redis connection in rate limiter
jest.mock('rate-limit-redis');

// Mock Logger to reduce noise
jest.mock('../utils/logger.js', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        http: jest.fn(),
    },
}));

beforeAll(async () => {
    // Any global setup
});

afterAll(async () => {
    // Restore all mocks
    jest.restoreAllMocks();
});
