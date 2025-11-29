import type { Content } from '@google/generative-ai';
import { genAI } from '../config/ai.js';
import { logger } from '../utils/logger.js';
import * as lessonService from './lessonService.js';

export type ChatMode = 'quick' | 'deep' | 'latest';
export type TutorMode = 'standard' | 'advanced';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

interface ChatRequestOptions {
    mode: ChatMode;
    messages: ChatMessage[];
}

interface TutorRequestOptions {
    mode: TutorMode;
    userId: string;
    lessonId: string;
    question: string;
}

interface AiResponse {
    text: string;
    sources?: Array<{ title?: string; url?: string }>;
}

const chatModeConfig: Record<ChatMode, { model: string; systemInstruction: string; tools?: Array<Record<string, unknown>> }> = {
    quick: {
        model: 'gemini-1.5-flash',
        systemInstruction:
            'You are SoloSuccess Intel Bot, an energetic "Girl Boss Drill Sergeant" mentor helping female founders. Be concise, encouraging, and tactical.',
    },
    deep: {
        model: 'gemini-1.5-pro',
        systemInstruction:
            'You are SoloSuccess Intel Bot, an elite strategist for female entrepreneurs. Provide thoughtful, structured guidance with actionable steps and maintain the confident drill-sergeant tone.',
    },
    latest: {
        model: 'gemini-1.5-flash',
        systemInstruction:
            'You are SoloSuccess Intel Bot with access to Google Search. Provide current, sourced answers in a confident drill-sergeant tone for female founders.',
        tools: [{ googleSearch: {} }],
    },
};

const tutorModeConfig: Record<TutorMode, { model: string }> = {
    standard: { model: 'gemini-1.5-flash' },
    advanced: { model: 'gemini-1.5-pro' },
};

function ensureClient() {
    if (!genAI) {
        throw new Error('AI client is not configured. Set GEMINI_API_KEY to enable AI features.');
    }
    return genAI;
}

function mapMessagesToContents(messages: ChatMessage[]): Content[] {
    return messages.map((message) => ({
        role: message.role === 'model' ? 'model' : 'user',
        parts: [{ text: message.text }],
    }));
}

function extractSources(response: any): Array<{ title?: string; url?: string }> | undefined {
    const grounding = response?.response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!grounding || !Array.isArray(grounding)) {
        return undefined;
    }

    return grounding
        .map((chunk: any) => chunk?.web)
        .filter(Boolean)
        .map((web: any) => ({ title: web?.title, url: web?.uri }));
}

export async function generateChatResponse(options: ChatRequestOptions): Promise<AiResponse> {
    const client = ensureClient();
    const config = chatModeConfig[options.mode] ?? chatModeConfig.quick;

    const model = client.getGenerativeModel({
        model: config.model,
        systemInstruction: config.systemInstruction,
        tools: config.tools,
    });

    const contents = mapMessagesToContents(options.messages);

    const result = await model.generateContent({ contents });
    const text = result.response.text();

    return {
        text,
        sources: extractSources(result),
    };
}

function buildLessonContext(lesson: lessonService.LessonDetails): string {
    const activitySummaries = lesson.activities
        .map((activity) => {
            const details = typeof activity.content === 'string' ? activity.content : JSON.stringify(activity.content);
            return `# Activity ${activity.activityNumber}: ${activity.title}\nType: ${activity.type}\nDetails: ${details}`;
        })
        .join('\n\n');

    return `Lesson Title: ${lesson.title}\nDescription: ${lesson.description}\nDuration (seconds): ${lesson.duration}\n\n${activitySummaries}`;
}

export async function generateTutorResponse(options: TutorRequestOptions): Promise<AiResponse> {
    const client = ensureClient();
    const config = tutorModeConfig[options.mode] ?? tutorModeConfig.standard;

    const lesson = await lessonService.getLessonById(options.userId, options.lessonId);

    if (!lesson) {
        throw new Error('Lesson not found or inaccessible');
    }

    const lessonContext = buildLessonContext(lesson);

    const model = client.getGenerativeModel({
        model: config.model,
        systemInstruction:
            'You are SoloSuccess AI Tutor. Respond only with information drawn from the provided lesson context. Maintain the Girl Boss Drill Sergeant tone: supportive, direct, and empowering.',
    });

    const contents: Content[] = [
        {
            role: 'user',
            parts: [
                {
                    text: `Lesson Context:\n${lessonContext}\n\nQuestion: ${options.question}`,
                },
            ],
        },
    ];

    const result = await model.generateContent({ contents });

    return {
        text: result.response.text(),
    };
}

export function handleAiError(error: unknown): Error {
    logger.error('AI service error', {
        error,
    });

    if (error instanceof Error) {
        return error;
    }

    return new Error('Unknown AI service error');
}
