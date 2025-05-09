/**
 * Custom i18n implementation
 * This file provides a simple internationalization implementation
 * that handles basic translation functionality with support for lazy loading
 */

// Create a simple i18n implementation
const I18n = class {
  constructor() {
    this.translations = {};
    this.locale = 'en';
    this.defaultLocale = 'en';
    this.enableFallback = true;
    this.missingBehavior = 'guess';
  }

  /**
   * Store translations
   * @param {Object} translations - Object containing translations for different locales
   */
  store(translations) {
    this.translations = translations;
  }

  /**
   * Translate a key
   * @param {string} key - The key to translate
   * @returns {string} - The translated string or the key itself if not found
   */
  t(key) {
    // Try to find the translation in the current locale
    if (this.translations[this.locale] && this.translations[this.locale][key]) {
      return this.translations[this.locale][key];
    }
    
    // If fallback is enabled, try the default locale
    if (this.enableFallback && this.translations[this.defaultLocale] && this.translations[this.defaultLocale][key]) {
      return this.translations[this.defaultLocale][key];
    }
    
    // If missing behavior is 'guess', return the key
    if (this.missingBehavior === 'guess') {
      return key;
    }
    
    // Otherwise return an empty string
    return '';
  }
};

export { I18n };
