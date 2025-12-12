import { useEffect, useMemo, useRef, useState } from 'react';
import { sendTutorQuestion } from '../../services/aiService';
import type { ChatMessage, TutorMode } from '../../types/ai';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';

interface LessonTutorModalProps {
  lessonId: string;
  lessonTitle: string;
  lessonSummary?: string;
  onClose: () => void;
}

const tutorModes: TutorMode[] = ['standard', 'advanced'];

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const INTRO_TEMPLATE = (title: string) =>
  `Intel Tutor here. We're locked on lesson "${title}". Ask precise questions and I'll draw only from official SoloSuccess intel.`;

function createMessage(role: ChatMessage['role'], text: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: createId(),
    role,
    text,
    ...overrides,
  };
}

export default function LessonTutorModal({ lessonId, lessonTitle, lessonSummary, onClose }: LessonTutorModalProps) {
  const [mode, setMode] = useState<TutorMode>('standard');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createMessage('model', INTRO_TEMPLATE(lessonTitle))]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([createMessage('model', INTRO_TEMPLATE(lessonTitle))]);
  }, [lessonId, lessonTitle]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = createMessage('user', trimmed);
    const loadingMessage = createMessage('model', 'Gathering lesson intel...', { isLoading: true });
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendTutorQuestion(lessonId, trimmed, mode);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === loadingMessage.id
            ? { ...message, text: response.text, isLoading: false }
            : message,
        ),
      );
    } catch (error: any) {
      logger.error('AI tutor failure', error);
      const fallback = error?.response?.data?.error?.message ?? 'Tutor link is disrupted. Retry in a moment.';
      setMessages((prev) => prev.map((message) => (message.id === loadingMessage.id ? { ...message, text: fallback, isLoading: false } : message)));
      showToast('The AI tutor is unavailable right now.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const headerSummary = useMemo(() => lessonSummary?.slice(0, 180) ?? 'Stay sharp. Complete activities in sequence for mastery.', [lessonSummary]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[90vh] sm:h-[640px] rounded-3xl p-[1.5px] bg-gradient-to-br from-cyan-400/60 via-pink-500/60 to-yellow-400/60 shadow-2xl">
        <div className="bg-black/80 rounded-[22px] h-full flex flex-col text-white">
          <header className="flex items-center justify-between gap-3 p-4 border-b border-white/15">
            <div>
              <h2 className="text-lg font-display tracking-wide text-white/90">AI Lesson Tutor</h2>
              <p className="text-xs text-white/60 line-clamp-2">{headerSummary}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white"
              aria-label="Close lesson tutor"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/15 text-xs">
            <span className="uppercase tracking-widest text-white/50">Intel Level:</span>
            {tutorModes.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  mode === value ? 'bg-hot-pink text-white shadow shadow-hot-pink/40' : 'bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                {value === 'standard' ? 'Standard' : 'Advanced' }
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-sm md:max-w-md p-4 rounded-2xl border ${
                    message.role === 'user'
                      ? 'bg-hot-pink text-white border-hot-pink/70'
                      : 'bg-white/5 text-white/85 border-white/10'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="animate-pulse">Gathering lesson intel...</div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 bg-white/5 rounded-full border border-white/10 px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about this lesson..."
                className="flex-1 bg-transparent focus:outline-none text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                className="w-10 h-10 rounded-full bg-hot-pink text-white flex items-center justify-center disabled:opacity-50"
                aria-label="Send question"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
