/**
 * Instagram URL Validator Module
 * Validates and parses Instagram URLs (posts, reels, clips)
 */

/**
 * Instagram URL validation result
 */
export interface ValidationResult {
  isValid: boolean;
  type?: 'reel' | 'post' | 'clip' | 'igtv';
  mediaId?: string;
  error?: string;
}

/**
 * Validates if a URL is a valid Instagram URL
 * Supports: direct URLs (instagram.com) and short URLs (ig.me, instagr.am)
 *
 * @param url - The URL to validate
 * @returns Validation result with media type and ID
 */
export function validateInstagramUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL must be a non-empty string',
    };
  }

  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname.toLowerCase();

    // Check if it's an Instagram domain
    if (!isInstagramDomain(hostname)) {
      return {
        isValid: false,
        error: 'URL must be from Instagram domain (instagram.com, instagr.am, ig.me)',
      };
    }

    // Extract media ID and type from pathname
    const result = extractMediaInfo(pathname);

    if (!result.mediaId) {
      return {
        isValid: false,
        error: 'Could not extract valid media ID from URL',
      };
    }

    return {
      isValid: true,
      ...result,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Checks if the hostname is a valid Instagram domain
 *
 * @param hostname - The hostname to check
 * @returns True if it's an Instagram domain
 */
function isInstagramDomain(hostname: string): boolean {
  const instagramDomains = [
    'instagram.com',
    'www.instagram.com',
    'instagr.am',
    'www.instagr.am',
    'ig.me',
    'www.ig.me',
  ];

  return instagramDomains.includes(hostname.toLowerCase());
}

/**
 * Extracts media information from Instagram URL pathname
 * Supports paths like: /reel/ID, /p/ID, /tv/ID
 *
 * @param pathname - The pathname from the URL
 * @returns Object with media type and ID
 */
function extractMediaInfo(
  pathname: string
): Pick<ValidationResult, 'type' | 'mediaId'> {
  // Remove leading/trailing slashes and split by /
  const parts = pathname
    .split('/')
    .filter((part) => part.length > 0 && part !== '?');

  if (parts.length < 2) {
    return {};
  }

  const [pathType, mediaId] = parts;

  // Map path type to media type
  const typeMap: Record<string, 'reel' | 'post' | 'clip' | 'igtv'> = {
    reel: 'reel',
    p: 'post',
    tv: 'igtv',
    clip: 'clip',
  };

  const type = typeMap[pathType];

  // Validate that mediaId is alphanumeric or contains underscores/hyphens
  const isValidId = /^[a-zA-Z0-9_-]+$/.test(mediaId);

  if (!type || !isValidId) {
    return {};
  }

  return {
    type,
    mediaId,
  };
}

/**
 * Formats an Instagram media ID back to a URL
 * Useful for creating download requests
 *
 * @param mediaId - The media ID
 * @param type - The media type (default: 'post')
 * @returns The Instagram URL
 */
export function formatInstagramUrl(
  mediaId: string,
  type: 'reel' | 'post' | 'clip' | 'igtv' = 'post'
): string {
  const pathMap: Record<string, string> = {
    reel: 'reel',
    post: 'p',
    clip: 'clip',
    igtv: 'tv',
  };

  const path = pathMap[type] || 'p';
  return `https://www.instagram.com/${path}/${mediaId}/`;
}
