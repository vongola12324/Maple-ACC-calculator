/**
 * Custom i18n configuration and initialization
 * This file configures and initializes our custom i18n implementation
 * with lazy loading of translation files
 */

import { I18n } from './i18n-wrapper.js';

// Initialize i18n instance
const i18n = new I18n();

// Set default locale
i18n.defaultLocale = 'en-US';

// Set fallback locale
i18n.enableFallback = true;
i18n.missingBehavior = 'guess';

// Define supported languages
const SupportedLanguages = {
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    flag: '🇺🇸',
    displayName: 'English (US)'
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    flag: '🇹🇼',
    displayName: '繁體中文'
  },
  // To add a new language, simply add a new entry here:
  // ja: {
  //   code: 'ja',
  //   name: 'Japanese',
  //   flag: '🇯🇵',
  //   displayName: '日本語'
  // },
};

// Get user's preferred language from localStorage or use browser language
const savedLocale = localStorage.getItem('locale');
let browserLocale = 'en-US'; // Default to English (US)

// Try to match browser language with supported languages
const browserLang = navigator.language;
// First try exact match
if (SupportedLanguages[browserLang]) {
  browserLocale = browserLang;
} else {
  // Then try language part only (e.g., 'en' from 'en-US')
  const langPart = browserLang.split('-')[0];
  // Find the first language that starts with the language part
  const matchedLang = Object.keys(SupportedLanguages).find(
    locale => locale === langPart || locale.startsWith(`${langPart}-`)
  );
  if (matchedLang) {
    browserLocale = matchedLang;
  }
}

i18n.locale = savedLocale || browserLocale;

// Cache for loaded translations
const loadedTranslations = {};

// Load a specific translation file
async function loadTranslationFile(locale) {
  // If already loaded, return from cache
  if (loadedTranslations[locale]) {
    return loadedTranslations[locale];
  }
  
  try {
    console.log(`Loading translations for ${locale}...`);
    const response = await fetch(`translations/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${locale} translations: ${response.status}`);
    }
    
    const translations = await response.json();
    
    // Cache the translations
    loadedTranslations[locale] = translations;
    
    return translations;
  } catch (error) {
    console.error(`Error loading ${locale} translations:`, error);
    return {};
  }
}

// Load translations
async function loadTranslations() {
  try {
    // Get current and default locales
    const currentLocale = i18n.locale;
    const defaultLocale = i18n.defaultLocale;
    
    // Initialize translations object
    const translations = {};
    
    // Always load default locale as fallback
    const defaultTranslations = await loadTranslationFile(defaultLocale);
    translations[defaultLocale] = defaultTranslations;
    
    // Load current locale if different from default
    if (currentLocale !== defaultLocale && SupportedLanguages[currentLocale]) {
      const currentTranslations = await loadTranslationFile(currentLocale);
      translations[currentLocale] = currentTranslations;
    }
    
    // Store translations
    i18n.store(translations);
    
    // Initial translation of the page
    translatePage();
    
    // Create language selector
    createLanguageSelector();
    
    return i18n;
  } catch (error) {
    console.error('Error loading translations:', error);
    return i18n; // Return i18n instance even if there's an error
  }
}

// Translate the page based on current locale
function translatePage() {
  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18n.t(key);
  });
  
  // Translate placeholders with data-i18n-placeholder attribute
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = i18n.t(key);
  });
  
  // Translate dropdown options
  translateDropdownOptions();
}

// Translate dropdown options
function translateDropdownOptions() {
  // Translate area dropdown options
  const areaOptions = document.querySelectorAll('#areas .dropdown-option');
  areaOptions.forEach(option => {
    const text = option.textContent;
    option.textContent = i18n.t(text);
  });
  
  // Update selected area text
  const selectedArea = document.querySelector('#areas .selected-option');
  if (selectedArea) {
    const value = selectedArea.getAttribute('data-value');
    const areaOption = document.querySelector(`#areas .dropdown-option[data-value="${value}"]`);
    if (areaOption) {
      selectedArea.textContent = i18n.t(areaOption.getAttribute('data-original-text') || areaOption.textContent);
    }
  }
  
  // Translate monster dropdown options if they exist
  const mobOptions = document.querySelectorAll('#mobs .dropdown-option');
  mobOptions.forEach(option => {
    const mobName = option.querySelector('.mob-name');
    if (mobName) {
      const originalName = mobName.getAttribute('data-original-text') || mobName.textContent;
      mobName.textContent = i18n.t(originalName);
    }
  });
}

// Create language selector
function createLanguageSelector() {
  // Create language switch button
  const languageSwitch = document.createElement('button');
  languageSwitch.className = 'language-switch';
  languageSwitch.innerHTML = '🌐';
  languageSwitch.setAttribute('aria-label', 'Change language');
  document.body.appendChild(languageSwitch);
  
  // Create language modal
  const languageModal = document.createElement('div');
  languageModal.className = 'language-modal';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'language-modal-content';
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'language-modal-header';
  
  const modalTitle = document.createElement('h3');
  modalTitle.textContent = i18n.t('Select Language');
  modalTitle.setAttribute('data-i18n', 'Select Language');
  
  const closeButton = document.createElement('button');
  closeButton.className = 'language-modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close');
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  // Create language options
  const languageOptions = document.createElement('div');
  languageOptions.className = 'language-options';
  
  // Dynamically create language options from SupportedLanguages enum
  Object.values(SupportedLanguages).forEach(language => {
    const option = document.createElement('div');
    option.className = `language-option ${i18n.locale === language.code ? 'active' : ''}`;
    option.setAttribute('data-locale', language.code);
    
    const icon = document.createElement('span');
    icon.className = 'language-option-icon';
    icon.textContent = language.flag;
    
    const text = document.createElement('span');
    text.className = 'language-option-text';
    text.textContent = language.displayName;
    
    option.appendChild(icon);
    option.appendChild(text);
    languageOptions.appendChild(option);
    
    // Add click event listener for this language option
    option.addEventListener('click', () => {
      changeLanguage(language.code);
      languageModal.classList.remove('active');
    });
  });
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(languageOptions);
  languageModal.appendChild(modalContent);
  
  // Add modal to document
  document.body.appendChild(languageModal);
  
  // Add event listeners
  languageSwitch.addEventListener('click', () => {
    languageModal.classList.add('active');
  });
  
  closeButton.addEventListener('click', () => {
    languageModal.classList.remove('active');
  });
  
  // Close modal when clicking outside content
  languageModal.addEventListener('click', (e) => {
    if (e.target === languageModal) {
      languageModal.classList.remove('active');
    }
  });
}

// Change language
async function changeLanguage(locale) {
  // Verify the locale is supported
  if (!SupportedLanguages[locale]) {
    console.error(`Unsupported locale: ${locale}`);
    return;
  }

  // If translations for this locale are not loaded yet, load them
  if (!loadedTranslations[locale]) {
    // Show loading indicator
    document.body.style.cursor = 'wait';
    
    try {
      // Load the translation file
      const translations = await loadTranslationFile(locale);
      
      // Update the i18n store with the new translations
      const updatedTranslations = { ...i18n.translations };
      updatedTranslations[locale] = translations;
      i18n.store(updatedTranslations);
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
    } finally {
      // Reset cursor
      document.body.style.cursor = 'default';
    }
  }
  
  // Set the new locale
  i18n.locale = locale;
  localStorage.setItem('locale', locale);
  
  // Update active class on language options
  document.querySelectorAll('.language-option').forEach(option => {
    option.classList.remove('active');
  });
  
  const activeOption = document.querySelector(`.language-option[data-locale="${locale}"]`);
  if (activeOption) {
    activeOption.classList.add('active');
  }
  
  // Translate the page
  translatePage();
}

// Export the i18n instance, loadTranslations function, and SupportedLanguages enum
export { i18n, loadTranslations, SupportedLanguages };

// Initialize translations when the script loads and export the promise
export const translationsLoaded = loadTranslations();
