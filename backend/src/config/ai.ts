import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

// Get and trim API key to remove any whitespace
const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
    logger.warn('GEMINI_API_KEY is not set. AI features will be disabled.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
