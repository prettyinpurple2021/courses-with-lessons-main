/**
 * Image optimization utilities for WebP conversion and responsive images
 */

/**
 * Generate srcSet for responsive images
 * @param baseUrl - Base URL of the image
 * @param widths - Array of widths to generate
 * @returns srcSet string
 */
export const generateSrcSet = (baseUrl: string, widths: number[]): string => {
  return widths
    .map((width) => {
      // If using a CDN, append width parameter
      const url = baseUrl.includes('cloudinary') || baseUrl.includes('cdn')
        ? `${baseUrl}?w=${width}`
        : baseUrl;
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Object with breakpoint sizes
 * @returns sizes string
 */
export const generateSizes = (breakpoints?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const defaults = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
  };

  const sizes = { ...defaults, ...breakpoints };

  return `(max-width: 767px) ${sizes.mobile}, (max-width: 1023px) ${sizes.tablet}, ${sizes.desktop}`;
};

/**
 * Convert image URL to WebP format (if using Cloudinary or similar CDN)
 * @param url - Original image URL
 * @returns WebP URL
 */
export const toWebP = (url: string): string => {
  if (url.includes('cloudinary')) {
    // Cloudinary transformation
    return url.replace('/upload/', '/upload/f_webp,q_auto/');
  }
  
  // For other CDNs or local images, return original
  // In production, you'd implement CDN-specific transformations
  return url;
};

/**
 * Get optimized image URL with quality and format parameters
 * @param url - Original image URL
 * @param options - Optimization options
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const { width, quality = 80, format = 'webp' } = options;

  if (url.includes('cloudinary')) {
    let transformation = `/upload/f_${format},q_${quality}`;
    if (width) {
      transformation += `,w_${width}`;
    }
    return url.replace('/upload/', transformation + '/');
  }

  // For other CDNs, implement their specific URL patterns
  return url;
};

/**
 * Preload critical images
 * @param urls - Array of image URLs to preload
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Check if browser supports WebP
 * @returns Promise<boolean>
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Get placeholder image data URL
 * @param width - Width of placeholder
 * @param height - Height of placeholder
 * @param color - Background color
 * @returns Data URL
 */
export const getPlaceholder = (
  width: number = 400,
  height: number = 300,
  color: string = '#708090'
): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(
    color
  )}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};
