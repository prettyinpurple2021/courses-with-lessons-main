export type ChatRole = 'user' | 'model';

export interface ChatMessage {
    id: string;
    role: ChatRole;
    text: string;
    isLoading?: boolean;
    sources?: Array<{ title?: string; url?: string }>;
}

export type ChatMode = 'quick' | 'deep' | 'latest';
export type TutorMode = 'standard' | 'advanced';

export interface ChatResponse {
    text: string;
    sources?: Array<{ title?: string; url?: string }>;
}
