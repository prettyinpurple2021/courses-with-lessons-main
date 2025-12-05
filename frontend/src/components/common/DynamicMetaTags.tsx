import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
}

const DEFAULT_META = {
  title: 'SoloSuccess Intel Academy - Entrepreneur Training Platform',
  description: 'Master entrepreneurship with our comprehensive course platform featuring interactive lessons, AI tutoring, and certification programs.',
  keywords: 'entrepreneurship, online courses, business training, certification, e-learning',
  author: 'SoloSuccess Intel Academy',
  ogType: 'website',
  twitterCard: 'summary_large_image' as const,
  robots: 'index, follow',
};

/**
 * Dynamic Meta Tags Component
 * 
 * Updates document meta tags dynamically based on current page
 */
export default function DynamicMetaTags(props: MetaTagsProps) {
  const location = useLocation();
  const meta = { ...DEFAULT_META, ...props };

  useEffect(() => {
    // Update document title
    document.title = meta.title || DEFAULT_META.title;

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const attr = selector.includes('property') ? 'property' : 'name';
        const value = selector.match(/["']([^"']+)["']/)?.[1];
        if (value) {
          element.setAttribute(attr, value);
          document.head.appendChild(element);
        }
      }
      element.setAttribute('content', content);
    };

    // Update basic meta tags
    if (meta.description) {
      updateMetaTag('meta[name="description"]', meta.description);
    }

    if (meta.keywords) {
      updateMetaTag('meta[name="keywords"]', meta.keywords);
    }

    if (meta.author) {
      updateMetaTag('meta[name="author"]', meta.author);
    }

    if (meta.robots) {
      updateMetaTag('meta[name="robots"]', meta.robots);
    }

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', meta.ogTitle || meta.title || DEFAULT_META.title);
    updateMetaTag('meta[property="og:description"]', meta.ogDescription || meta.description || DEFAULT_META.description);
    updateMetaTag('meta[property="og:type"]', meta.ogType || DEFAULT_META.ogType);

    if (meta.ogImage) {
      updateMetaTag('meta[property="og:image"]', meta.ogImage);
      updateMetaTag('meta[property="og:image:alt"]', meta.ogTitle || meta.title || DEFAULT_META.title);
    }

    // Use canonical URL if provided, otherwise construct from current location
    const currentUrl = meta.ogUrl || meta.canonicalUrl || `${window.location.origin}${location.pathname}`;
    updateMetaTag('meta[property="og:url"]', currentUrl);

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', meta.twitterCard || DEFAULT_META.twitterCard);
    updateMetaTag('meta[name="twitter:title"]', meta.twitterTitle || meta.ogTitle || meta.title || DEFAULT_META.title);
    updateMetaTag('meta[name="twitter:description"]', meta.twitterDescription || meta.ogDescription || meta.description || DEFAULT_META.description);

    if (meta.twitterImage || meta.ogImage) {
      updateMetaTag('meta[name="twitter:image"]', meta.twitterImage || meta.ogImage || '');
    }

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [meta, location]);

  return null;
}

