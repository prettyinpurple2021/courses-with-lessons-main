import React, { useState, useEffect } from 'react';
import GlassmorphicButton from './GlassmorphicButton';

interface Shortcut {
  keys: string[];
  description: string;
}

const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    { keys: ['?'], description: 'Show/hide this help menu' },
    { keys: ['d'], description: 'Go to Dashboard' },
    { keys: ['p'], description: 'Go to Profile' },
    { keys: ['c'], description: 'Go to Community' },
    { keys: ['/'], description: 'Focus search (when available)' },
    { keys: ['Esc'], description: 'Close modal or menu' },
    { keys: ['Tab'], description: 'Navigate forward through elements' },
    { keys: ['Shift', 'Tab'], description: 'Navigate backward through elements' },
    { keys: ['Enter'], description: 'Activate focused element' },
    { keys: ['Space'], description: 'Activate buttons or checkboxes' },
    { keys: ['Arrow Keys'], description: 'Navigate through lists and menus' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 glassmorphic p-3 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Shift + ?)"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="glassmorphic-elevated max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="shortcuts-title" className="text-2xl font-bold text-white">
              ⌨️ Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-hot-pink transition-colors p-2"
              aria-label="Close shortcuts help"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
              >
                <span className="text-gray-300">{shortcut.description}</span>
                <div className="flex gap-2">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-3 py-1 bg-black/30 border border-white/20 rounded text-white text-sm font-mono">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-gray-400">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400 text-center">
              Press <kbd className="px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-xs font-mono">Shift</kbd> + <kbd className="px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-xs font-mono">?</kbd> to toggle this menu
            </p>
          </div>

          <div className="mt-4">
            <GlassmorphicButton
              onClick={() => setIsOpen(false)}
              variant="primary"
              className="w-full"
            >
              Got it!
            </GlassmorphicButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
