import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GlassmorphicButton from './GlassmorphicButton';
import GlassmorphicCard from './GlassmorphicCard';

const COOKIE_CONSENT_KEY = 'cookie_consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved.preferences || preferences);
      } catch {
        // Invalid saved data, show banner again
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    
    // Update analytics based on preferences
    if (prefs.analytics) {
      // Enable analytics (GA4, Plausible, etc.)
      window.dispatchEvent(new CustomEvent('enableAnalytics'));
    } else {
      // Disable analytics
      window.dispatchEvent(new CustomEvent('disableAnalytics'));
    }

    // Update marketing cookies if needed
    if (prefs.marketing) {
      window.dispatchEvent(new CustomEvent('enableMarketing'));
    } else {
      window.dispatchEvent(new CustomEvent('disableMarketing'));
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <GlassmorphicCard className="max-w-4xl mx-auto">
        <div className="p-6 space-y-4">
          <div>
            <h2
              id="cookie-consent-title"
              className="text-2xl font-bold text-glossy-black mb-2"
            >
              🍪 Cookie Consent
            </h2>
            <p
              id="cookie-consent-description"
              className="text-steel-grey"
            >
              We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts.
              By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences.
            </p>
          </div>

          {!showSettings ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <GlassmorphicButton
                onClick={handleAcceptAll}
                className="flex-1 bg-hot-pink hover:bg-hot-pink/90 text-white"
              >
                Accept All
              </GlassmorphicButton>
              <GlassmorphicButton
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="flex-1"
              >
                Customize Preferences
              </GlassmorphicButton>
              <GlassmorphicButton
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1"
              >
                Reject All
              </GlassmorphicButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-girly-pink/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-glossy-black">Necessary Cookies</h3>
                    <p className="text-sm text-steel-grey">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="w-5 h-5 text-hot-pink rounded"
                    aria-label="Necessary cookies (always enabled)"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-girly-pink/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-glossy-black">Analytics Cookies</h3>
                    <p className="text-sm text-steel-grey">
                      Help us understand how visitors interact with our website (Google Analytics, Plausible).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="w-5 h-5 text-hot-pink rounded focus:ring-2 focus:ring-hot-pink"
                    aria-label="Enable analytics cookies"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-girly-pink/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-glossy-black">Marketing Cookies</h3>
                    <p className="text-sm text-steel-grey">
                      Used to track visitors across websites for marketing purposes.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="w-5 h-5 text-hot-pink rounded focus:ring-2 focus:ring-hot-pink"
                    aria-label="Enable marketing cookies"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <GlassmorphicButton
                  onClick={handleSavePreferences}
                  className="flex-1 bg-hot-pink hover:bg-hot-pink/90 text-white"
                >
                  Save Preferences
                </GlassmorphicButton>
                <GlassmorphicButton
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </GlassmorphicButton>
              </div>
            </div>
          )}

          <div className="text-xs text-steel-grey pt-2 border-t border-girly-pink/30">
            <p>
              Learn more about how we use cookies in our{' '}
              <Link
                to="/privacy"
                className="text-hot-pink hover:underline"
              >
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link
                to="/terms"
                className="text-hot-pink hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

