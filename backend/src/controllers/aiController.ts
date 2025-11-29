import { Request, Response, NextFunction } from 'express';
import {
    generateChatResponse,
    generateTutorResponse,
    handleAiError,
    type ChatMode,
    type TutorMode,
    type ChatMessage,
} from '../services/aiService.js';

interface ChatRequestBody {
    messages: ChatMessage[];
    mode?: ChatMode;
}

interface TutorRequestBody {
    lessonId: string;
    question: string;
    mode?: TutorMode;
}

function validateMessages(messages: unknown): messages is ChatMessage[] {
    if (!Array.isArray(messages)) {
        return false;
    }

    return messages.every((message) => {
        if (typeof message !== 'object' || message === null) {
            return false;
        }
        const { role, text } = message as ChatMessage;
        return (role === 'user' || role === 'model') && typeof text === 'string' && text.trim().length > 0;
    });
}

export async function chat(req: Request<unknown, unknown, ChatRequestBody>, res: Response, next: NextFunction) {
    try {
        const { messages, mode = 'quick' } = req.body;

        if (!validateMessages(messages)) {
            res.status(400).json({
                success: false,
                error: { message: 'Invalid messages payload' },
            });
            return;
        }

        const response = await generateChatResponse({
            messages,
            mode,
        });

        res.json({
            success: true,
            data: response,
        });
    } catch (error) {
        next(handleAiError(error));
    }
}

export async function tutor(req: Request<unknown, unknown, TutorRequestBody>, res: Response, next: NextFunction) {
    try {
        const { lessonId, question, mode = 'standard' } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: { message: 'Unauthorized' },
            });
            return;
        }

        if (!lessonId || typeof lessonId !== 'string') {
            res.status(400).json({
                success: false,
                error: { message: 'lessonId is required' },
            });
            return;
        }

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: { message: 'question is required' },
            });
            return;
        }

        const response = await generateTutorResponse({
            lessonId,
            question,
            mode,
            userId,
        });

        res.json({
            success: true,
            data: response,
        });
    } catch (error) {
        next(handleAiError(error));
    }
}
