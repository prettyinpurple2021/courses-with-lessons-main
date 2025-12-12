import { useEffect } from 'react';
import { logger } from '../../utils/logger';

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Google Analytics 4 Component
 * 
 * Loads the Google Analytics 4 script and initializes tracking.
 * Add this component to your app's root or index.html.
 */
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    // Check if gtag is already loaded
    if ((window as any).gtag) {
      logger.debug('[GA4] Already initialized');
      return;
    }

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        send_page_view: false // We'll handle page views manually
      });
    `;
    document.head.appendChild(script2);

    logger.info('[GA4] Initialized with measurement ID', { measurementId });

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [measurementId]);

  return null;
}
