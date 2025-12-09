/**
 * Service Worker registration utility
 * Handles registration, updates, and lifecycle events
 */

type ServiceWorkerConfig = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
};

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
  };
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Register service worker
 */
export function register(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    // Wait for page load to register service worker
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      if (isLocalhost) {
        // Check if service worker exists in localhost
        checkValidServiceWorker(swUrl, config);

        // Log additional info in localhost
        if (import.meta.env.DEV) {
          navigator.serviceWorker.ready.then(() => {
            console.log(
              'This web app is being served cache-first by a service worker. ' +
              'To learn more, visit https://cra.link/PWA'
            );
          });
        }
      } else {
        // Register service worker in production
        registerValidSW(swUrl, config);
      }
    });

    // Setup online/offline listeners
    setupNetworkListeners(config);
  }
}

/**
 * Register valid service worker
 */
function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      if (import.meta.env.DEV) {
        console.log('[SW] Service Worker registered:', registration);
      }

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              if (import.meta.env.DEV) {
                console.log('[SW] New content is available; please refresh.');
              }

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content cached for offline use
              if (import.meta.env.DEV) {
                console.log('[SW] Content is cached for offline use.');
              }

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    })
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error('[SW] Error during service worker registration:', error);
      }
    });
}

/**
 * Check if service worker is valid
 */
function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service worker not found, reload page
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found, proceed with registration
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      if (import.meta.env.DEV) {
        console.log('[SW] No internet connection found. App is running in offline mode.');
      }
    });
}

/**
 * Setup network status listeners
 */
function setupNetworkListeners(config?: ServiceWorkerConfig) {
  window.addEventListener('online', () => {
    if (import.meta.env.DEV) {
      console.log('[SW] Connection restored');
    }
    if (config && config.onOnline) {
      config.onOnline();
    }
  });

  window.addEventListener('offline', () => {
    if (import.meta.env.DEV) {
      console.log('[SW] Connection lost');
    }
    if (config && config.onOffline) {
      config.onOffline();
    }
  });
}

/**
 * Unregister service worker
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('[SW] Error unregistering service worker:', error);
        }
      });
  }
}

/**
 * Update service worker
 */
export function update() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
      })
      .catch((error) => {
        console.error('[SW] Error updating service worker:', error);
      });
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaiting() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Clear all caches
 */
export function clearCaches() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as NavigatorWithStandalone).standalone === true)
  );
}

/**
 * Request background sync
 */
export async function requestBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as ServiceWorkerRegistrationWithSync).sync.register(tag);
        console.log('[SW] Background sync registered:', tag);
      }
    } catch (error) {
      console.error('[SW] Background sync registration failed:', error);
    }
  }
}
