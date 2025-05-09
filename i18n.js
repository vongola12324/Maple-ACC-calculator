/**
 * Custom i18n configuration and initialization
 * This file configures and initializes our custom i18n implementation
 * with lazy loading of translation files
 */

import { I18n } from './i18n-wrapper.js';

// Initialize i18n instance
const i18n = new I18n();

// Set default locale
i18n.defaultLocale = 'en';

// Set fallback locale
i18n.enableFallback = true;
i18n.missingBehavior = 'guess';

// Get user's preferred language from localStorage or use browser language
const savedLocale = localStorage.getItem('locale');
const browserLocale = navigator.language.startsWith('zh') ? 'zh-TW' : 'en';
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
    // Only load the current locale initially
    const currentLocale = i18n.locale;
    
    // Always load English as fallback
    const enTranslations = await loadTranslationFile('en');
    
    // Load current locale if not English
    let currentTranslations = enTranslations;
    if (currentLocale !== 'en') {
      currentTranslations = await loadTranslationFile(currentLocale);
    }
    
    // Set translations
    const translations = {
      en: enTranslations
    };
    
    if (currentLocale !== 'en') {
      translations[currentLocale] = currentTranslations;
    }
    
    i18n.store(translations);
    
    // Initial translation of the page
    translatePage();
    
    // Create language selector
    createLanguageSelector();
    
    return i18n;
  } catch (error) {
    console.error('Error loading translations:', error);
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
  
  // English option
  const enOption = document.createElement('div');
  enOption.className = `language-option ${i18n.locale === 'en' ? 'active' : ''}`;
  enOption.setAttribute('data-locale', 'en');
  
  const enIcon = document.createElement('span');
  enIcon.className = 'language-option-icon';
  enIcon.textContent = '🇺🇸';
  
  const enText = document.createElement('span');
  enText.className = 'language-option-text';
  enText.textContent = 'English';
  
  enOption.appendChild(enIcon);
  enOption.appendChild(enText);
  
  // Chinese option
  const zhOption = document.createElement('div');
  zhOption.className = `language-option ${i18n.locale === 'zh-TW' ? 'active' : ''}`;
  zhOption.setAttribute('data-locale', 'zh-TW');
  
  const zhIcon = document.createElement('span');
  zhIcon.className = 'language-option-icon';
  zhIcon.textContent = '🇹🇼';
  
  const zhText = document.createElement('span');
  zhText.className = 'language-option-text';
  zhText.textContent = '繁體中文';
  
  zhOption.appendChild(zhIcon);
  zhOption.appendChild(zhText);
  
  // Add options to container
  languageOptions.appendChild(enOption);
  languageOptions.appendChild(zhOption);
  
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
  
  // Language selection
  enOption.addEventListener('click', () => {
    changeLanguage('en');
    languageModal.classList.remove('active');
  });
  
  zhOption.addEventListener('click', () => {
    changeLanguage('zh-TW');
    languageModal.classList.remove('active');
  });
}

// Change language
async function changeLanguage(locale) {
  // If translations for this locale are not loaded yet, load them
  if (!loadedTranslations[locale]) {
    // Show loading indicator
    document.body.style.cursor = 'wait';
    
    // Load the translation file
    const translations = await loadTranslationFile(locale);
    
    // Update the i18n store with the new translations
    const updatedTranslations = { ...i18n.translations };
    updatedTranslations[locale] = translations;
    i18n.store(updatedTranslations);
    
    // Reset cursor
    document.body.style.cursor = 'default';
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

// Export the i18n instance and the loadTranslations function
export { i18n, loadTranslations };

// Initialize translations when the script loads and export the promise
export const translationsLoaded = loadTranslations();
