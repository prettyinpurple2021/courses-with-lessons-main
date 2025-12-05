import { useEffect } from 'react';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateEducationalOrganizationSchema,
  injectStructuredData,
  removeStructuredData,
} from '../utils/structuredData';

export interface PageMetaOptions {
  /** @deprecated Use DynamicMetaTags component for title instead */
  title?: string;
  /** @deprecated Use DynamicMetaTags component for description instead */
  description?: string;
  /** @deprecated Use DynamicMetaTags component for keywords instead */
  keywords?: string;
  /** @deprecated Use DynamicMetaTags component for ogImage instead */
  ogImage?: string;
  /** Custom structured data to inject (JSON-LD) */
  structuredData?: object;
  /** Include Organization schema in structured data */
  includeOrganization?: boolean;
  /** Include WebSite and EducationalOrganization schemas in structured data */
  includeWebSite?: boolean;
}

/**
 * Hook to manage page-level structured data (JSON-LD)
 * Note: Use DynamicMetaTags component for meta tags and document.title
 */
export function usePageMeta(options: PageMetaOptions = {}) {
  useEffect(() => {
    // Note: document.title should be handled by DynamicMetaTags component
    // This hook only manages structured data (JSON-LD)

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

