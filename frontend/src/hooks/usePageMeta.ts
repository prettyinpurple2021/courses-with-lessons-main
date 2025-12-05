import { useEffect } from 'react';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateEducationalOrganizationSchema,
  injectStructuredData,
  removeStructuredData,
} from '../utils/structuredData';

export interface PageMetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  structuredData?: object;
  includeOrganization?: boolean;
  includeWebSite?: boolean;
}

/**
 * Hook to manage page-level SEO meta tags and structured data
 */
export function usePageMeta(options: PageMetaOptions = {}) {
  useEffect(() => {
    // Update document title
    if (options.title) {
      document.title = `${options.title} | SoloSuccess Intel Academy`;
    }

    // Inject structured data
    const schemas: object[] = [];

    if (options.includeOrganization) {
      schemas.push(generateOrganizationSchema());
    }

    if (options.includeWebSite) {
      schemas.push(generateWebSiteSchema());
      schemas.push(generateEducationalOrganizationSchema());
    }

    if (options.structuredData) {
      schemas.push(options.structuredData);
    }

    // Combine all schemas into a single JSON-LD script
    if (schemas.length > 0) {
      const combinedSchema = schemas.length === 1 
        ? schemas[0]
        : {
            '@context': 'https://schema.org',
            '@graph': schemas,
          };
      
      injectStructuredData(combinedSchema);
    }

    // Cleanup on unmount
    return () => {
      removeStructuredData();
    };
  }, [options]);
}

