import { api } from './api';
import type { ChatMessage, ChatMode, TutorMode, ChatResponse } from '../types/ai';

interface BackendChatMessage {
    role: 'user' | 'model';
    text: string;
}

export async function sendChatRequest(
    messages: ChatMessage[],
    mode: ChatMode
): Promise<ChatResponse> {
    const payloadMessages: BackendChatMessage[] = messages.map(({ role, text }) => ({ role, text }));

    const response = await api.post('/ai/chat', {
        messages: payloadMessages,
        mode,
    });

    return response.data.data;
}

export async function sendTutorQuestion(
    lessonId: string,
    question: string,
    mode: TutorMode
): Promise<ChatResponse> {
    const response = await api.post('/ai/tutor', {
        lessonId,
        question,
        mode,
    });

    return response.data.data;
}
