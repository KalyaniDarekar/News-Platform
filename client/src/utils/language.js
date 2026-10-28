/**
 * Language & Typography Utilities
 * Handles language detection (Marathi / Devanagari script) and typography adaptations.
 */

// Devanagari Unicode Block: U+0900 to U+097F
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/**
 * Checks whether an article object or a text string is in Marathi or Devanagari script.
 * @param {Object|string|null|undefined} articleOrText
 * @returns {boolean}
 */
export function isMarathi(articleOrText) {
  if (!articleOrText) return false;

  if (typeof articleOrText === 'string') {
    return DEVANAGARI_REGEX.test(articleOrText);
  }

  if (typeof articleOrText === 'object') {
    if (articleOrText.language === 'mr' || articleOrText.lang === 'mr') {
      return true;
    }
    const sample = `${articleOrText.title || ''} ${articleOrText.short_description || articleOrText.summary || ''} ${articleOrText.kicker || ''}`;
    return DEVANAGARI_REGEX.test(sample);
  }

  return false;
}

/**
 * Returns the CSS class with Marathi font modifier if the article/text is Marathi.
 * @param {string} baseClass - Base class name like 'headline-hero', 'headline-card', etc.
 * @param {Object|string} articleOrText - Article object or title string
 * @returns {string}
 */
export function getHeadlineClass(baseClass, articleOrText) {
  return isMarathi(articleOrText) ? `${baseClass} lang-mr` : baseClass;
}
