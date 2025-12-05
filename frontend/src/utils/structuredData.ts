/**
 * Structured Data (JSON-LD) Utilities
 * 
 * Generates schema.org structured data for SEO
 */

export interface Course {
  id: string;
  title: string;
  description: string;
  courseNumber: number;
  thumbnail?: string;
  duration?: string;
  instructor?: string;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SoloSuccess Intel Academy',
    description: 'Entrepreneur Training Platform',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    sameAs: [
      // Add social media URLs here
    ],
  };
}

/**
 * Generate Course structured data
 */
export function generateCourseSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'SoloSuccess Intel Academy',
      sameAs: window.location.origin,
    },
    courseCode: `COURSE-${course.courseNumber}`,
    ...(course.thumbnail && { image: course.thumbnail }),
    ...(course.duration && { timeRequired: course.duration }),
    ...(course.instructor && {
      instructor: {
        '@type': 'Person',
        name: course.instructor,
      },
    }),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebSite structured data
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SoloSuccess Intel Academy',
    description: 'Master entrepreneurship with comprehensive courses',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate EducationalOrganization structured data
 */
export function generateEducationalOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'SoloSuccess Intel Academy',
    description: 'Online platform for entrepreneur education and certification',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
  };
}

/**
 * Inject structured data into page
 */
export function injectStructuredData(schema: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  
  // Remove existing structured data script if present
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(script);
}

/**
 * Remove structured data from page
 */
export function removeStructuredData() {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (script) {
    script.remove();
  }
}

