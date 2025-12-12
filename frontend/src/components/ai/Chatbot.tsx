import { useEffect, useMemo, useRef, useState } from 'react';
import { sendChatRequest } from '../../services/aiService';
import type { ChatMessage, ChatMode, ChatResponse } from '../../types/ai';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';

interface ModeConfig {
  modelLabel: string;
  description: string;
  gradient: string;
}

const modeConfig: Record<ChatMode, ModeConfig> = {
  quick: {
    modelLabel: 'Quick Assist',
    description: 'Fast tactical guidance for simple questions.',
    gradient: 'from-cyan-400/60 via-pink-500/60 to-yellow-400/60',
  },
  deep: {
    modelLabel: 'Deep Dive',
    description: 'Structured strategy for complex problems.',
    gradient: 'from-purple-500/60 via-hot-pink/60 to-amber-400/60',
  },
  latest: {
    modelLabel: 'Latest Intel',
    description: 'Pulls fresh intel with web grounding.',
    gradient: 'from-emerald-400/60 via-blue-500/60 to-violet-500/60',
  },
};

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function createMessage(role: ChatMessage['role'], text: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: createId(),
    role,
    text,
    ...overrides,
  };
}

function mergeSources(message: ChatMessage, response: ChatResponse): ChatMessage {
  return {
    ...message,
    text: response.text,
    isLoading: false,
    sources: response.sources,
  };
}

const INITIAL_PROMPT =
  "Intel Bot reporting for duty. I am your Girl Boss Drill Sergeant—ask me anything about launching, scaling, or surviving entrepreneurship.";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('quick');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createMessage('model', INITIAL_PROMPT)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([createMessage('model', INITIAL_PROMPT)]);
  }, [mode]);

  const buttonLabel = useMemo(
    () => (isOpen ? 'Close Intel Bot' : 'Open Intel Bot'),
    [isOpen]
  );

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = createMessage('user', trimmed);
    const loadingMessage = createMessage('model', 'Deploying intel...', { isLoading: true });
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatRequest([...messages, userMessage], mode);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === loadingMessage.id
            ? mergeSources(message, response)
            : message
        )
      );
    } catch (error: any) {
      logger.error('AI chat failure', error);
      const fallback = error?.response?.data?.error?.message ?? 'Intel Bot is offline. Try again shortly.';
      setMessages((prev) =>
        prev.map((message) => (message.id === loadingMessage.id ? { ...message, text: fallback, isLoading: false } : message))
      );
      showToast('The AI assistant ran into an issue.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-hot-pink text-white shadow-2xl shadow-hot-pink/40 flex items-center justify-center transition-transform duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-expanded={isOpen}
        aria-controls="intel-bot-panel"
      >
        <span className="sr-only">{buttonLabel}</span>
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 4h16v12H5.17L4 17.17V4zm0-2a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2H4z" />
        </svg>
      </button>

      <div
        id="intel-bot-panel"
        className={`fixed bottom-8 right-8 z-40 transition-all duration-500 ease-in-out ${
          isOpen
            ? 'opacity-100 translate-y-0 w-[calc(100%-2rem)] sm:w-[420px] h-[min(calc(100%-2rem),680px)]'
            : 'opacity-0 translate-y-10 pointer-events-none w-0 h-0'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Intel Bot AI assistant"
      >
        <div className={`rounded-3xl p-[1.5px] bg-gradient-to-br ${modeConfig[mode].gradient} shadow-2xl h-full`}>
          <div className="bg-black/75 backdrop-blur-2xl rounded-[22px] h-full flex flex-col text-white">
            <header className="flex items-center justify-between p-4 border-b border-white/15">
              <div>
                <h3 className="text-lg font-display tracking-wide">Intel Bot</h3>
                <p className="text-xs text-white/60">{modeConfig[mode].description}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
                aria-label="Close Intel Bot"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex p-2 gap-2 border-b border-white/15">
              {(Object.keys(modeConfig) as ChatMode[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs transition-colors duration-200 ${
                    mode === key ? 'bg-hot-pink text-white shadow-lg shadow-hot-pink/30' : 'bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{modeConfig[key].modelLabel}</div>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-md p-4 rounded-2xl border ${
                      message.role === 'user'
                        ? 'bg-hot-pink text-white border-hot-pink/70'
                        : 'bg-white/5 text-white/85 border-white/10'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="animate-pulse">Deploying intel...</div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-white/60">Sources</p>
                        <ul className="space-y-1">
                          {message.sources.map((source, index) => (
                            <li key={index} className="text-xs">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-300 hover:underline"
                              >
                                {source.title ?? source.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 bg-white/5 rounded-full border border-white/10 px-4 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Brief Intel Bot..."
                  className="flex-1 bg-transparent focus:outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || input.trim().length === 0}
                  className="w-10 h-10 rounded-full bg-hot-pink text-white flex items-center justify-center disabled:opacity-50"
                  aria-label="Send message"
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
    </>
  );
}
