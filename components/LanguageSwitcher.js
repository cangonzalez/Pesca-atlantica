'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const LANGUAGES = [
  { code: 'es', label: 'ES', title: 'Español' },
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'el', label: 'GR', title: 'Griego' }
];

function clearGoogleTranslateCookie() {
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
}

export default function LanguageSwitcher() {
  const [activeLanguage, setActiveLanguage] = useState('es');

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'en,el',
          autoDisplay: false
        },
        'google_translate_element'
      );
    };
  }, []);

  const changeLanguage = (language) => {
    setActiveLanguage(language);

    if (language === 'es') {
      clearGoogleTranslateCookie();
      window.location.reload();
      return;
    }

    const combo = document.querySelector('.goog-te-combo');

    if (combo) {
      combo.value = language;
      combo.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="language-switcher" aria-label="Traductor de idioma">
      <div id="google_translate_element" className="google-translate-widget" />
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          className={activeLanguage === language.code ? 'active' : ''}
          onClick={() => changeLanguage(language.code)}
          title={language.title}
          aria-label={`Traducir a ${language.title}`}
        >
          {language.label}
        </button>
      ))}
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </div>
  );
}
