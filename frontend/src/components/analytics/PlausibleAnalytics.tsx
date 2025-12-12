import { useEffect } from 'react';
import { logger } from '../../utils/logger';

interface PlausibleAnalyticsProps {
  domain: string;
  scriptSrc?: string;
}

/**
 * Plausible Analytics Component
 * 
 * Loads the Plausible Analytics script for privacy-friendly tracking.
 * Add this component to your app's root or index.html.
 */
export default function PlausibleAnalytics({ 
  domain, 
  scriptSrc = 'https://plausible.io/js/script.js' 
}: PlausibleAnalyticsProps) {
  useEffect(() => {
    if (!domain || typeof window === 'undefined') return;

    // Check if plausible is already loaded
    if ((window as any).plausible) {
      logger.debug('[Plausible] Already initialized');
      return;
    }

    // Load Plausible Analytics script
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', domain);
    script.src = scriptSrc;
    document.head.appendChild(script);

    logger.info('[Plausible] Initialized for domain', { domain });

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, [domain, scriptSrc]);

  return null;
}
