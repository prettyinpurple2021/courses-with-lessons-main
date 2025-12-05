import { api } from './api';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentData {
  preferences: CookiePreferences;
  version: string;
  timestamp?: string;
}

/**
 * Generate or retrieve session ID for anonymous users
 */
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('session_id');
  
  if (!sessionId) {
    // Generate a simple session ID
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Cookie Consent Service
 * 
 * Handles cookie consent storage both client-side (localStorage) and server-side (database)
 * for GDPR compliance and audit trail
 */
export class CookieConsentService {
  private static readonly CONSENT_KEY = 'cookie_consent';
  private static readonly VERSION = '1.0';

  /**
   * Store consent preferences
   * Stores in localStorage (immediate UX) and syncs to backend (compliance)
   */
  static async storeConsent(preferences: CookiePreferences): Promise<void> {
    const consentData: CookieConsentData = {
      preferences,
      version: this.VERSION,
      timestamp: new Date().toISOString(),
    };

    // 1. Store in localStorage for immediate client-side access
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentData));

    // 2. Sync to backend for compliance and audit trail
    try {
      const sessionId = getOrCreateSessionId();
      
      await api.post('/consent/cookie', {
        preferences,
        version: this.VERSION,
        sessionId,
      });
    } catch (error) {
      // Log error but don't block UX - localStorage is primary
      if (import.meta.env.DEV) {
        console.error('Failed to sync cookie consent to backend:', error);
      }
      // In production, you might want to retry or queue this
    }
  }

  /**
   * Get consent preferences from localStorage
   */
  static getConsent(): CookieConsentData | null {
    try {
      const consent = localStorage.getItem(this.CONSENT_KEY);
      if (!consent) {
        return null;
      }
      return JSON.parse(consent) as CookieConsentData;
    } catch {
      return null;
    }
  }

  /**
   * Get consent preferences from server (fallback/verification)
   */
  static async getConsentFromServer(): Promise<CookieConsentData | null> {
    try {
      const sessionId = getOrCreateSessionId();
      const response = await api.get('/consent/cookie', {
        params: { sessionId },
      });
      return response.data.data;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has given consent
   */
  static hasConsent(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Check if analytics consent is given
   */
  static hasAnalyticsConsent(): boolean {
    const consent = this.getConsent();
    return consent?.preferences.analytics ?? false;
  }

  /**
   * Check if marketing consent is given
   */
  static hasMarketingConsent(): boolean {
    const consent = this.getConsent();
    return consent?.preferences.marketing ?? false;
  }

  /**
   * Delete consent (GDPR right to be forgotten)
   */
  static async deleteConsent(): Promise<void> {
    // Remove from localStorage
    localStorage.removeItem(this.CONSENT_KEY);
    localStorage.removeItem('session_id');

    // Delete from backend
    try {
      await api.delete('/consent/cookie');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to delete cookie consent from backend:', error);
      }
    }
  }

  /**
   * Sync consent to server (useful for retry after network failure)
   */
  static async syncToServer(): Promise<boolean> {
    const consent = this.getConsent();
    if (!consent) {
      return false;
    }

    try {
      const sessionId = getOrCreateSessionId();
      await api.post('/consent/cookie', {
        preferences: consent.preferences,
        version: consent.version,
        sessionId,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export default CookieConsentService;

