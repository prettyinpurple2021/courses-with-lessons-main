import React, { useState, useEffect } from 'react';
import { runWCAGAudit } from '../../utils/wcagCompliance';

/**
 * Development-only component for checking WCAG compliance
 * Only renders in development mode
 */
const AccessibilityChecker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [auditResults, setAuditResults] = useState<{
    passed: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const runAudit = () => {
    const results = runWCAGAudit();
    setAuditResults(results);
    setIsOpen(true);
  };

  useEffect(() => {
    // Run audit on mount in development
    if (import.meta.env.DEV) {
      setTimeout(runAudit, 2000);
    }
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={runAudit}
        className="fixed bottom-20 right-4 z-40 glassmorphic p-3 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Run accessibility audit"
        title="Run WCAG AA audit"
        style={{
          background: 'rgba(255, 20, 147, 0.2)',
          border: '2px solid rgba(255, 20, 147, 0.5)',
        }}
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="glassmorphic-elevated max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              ♿ WCAG AA Accessibility Audit
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-hot-pink transition-colors p-2"
              aria-label="Close audit results"
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

          {auditResults && (
            <div className="space-y-6">
              {/* Summary */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  auditResults.passed
                    ? 'bg-green-500/20 border-green-500'
                    : 'bg-red-500/20 border-red-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {auditResults.passed ? (
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {auditResults.passed ? 'All Checks Passed!' : 'Issues Found'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {auditResults.errors.length} errors, {auditResults.warnings.length}{' '}
                      warnings
                    </p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {auditResults.errors.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-red-400 mb-3">
                    ❌ Errors ({auditResults.errors.length})
                  </h3>
                  <div className="space-y-2">
                    {auditResults.errors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-gray-300"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {auditResults.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">
                    ⚠️ Warnings ({auditResults.warnings.length})
                  </h3>
                  <div className="space-y-2">
                    {auditResults.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-gray-300"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No issues */}
              {auditResults.errors.length === 0 && auditResults.warnings.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-green-400 text-lg">
                    ✨ No accessibility issues detected!
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    This page meets WCAG 2.1 Level AA standards
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={runAudit}
                  className="flex-1 px-4 py-2 bg-hot-pink/20 hover:bg-hot-pink/30 border border-hot-pink/50 rounded-lg text-white transition-colors"
                >
                  Re-run Audit
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              This checker only appears in development mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityChecker;
