'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'ko';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  langLabel: string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  langLabel: 'English',
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Persist selection in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_lang') as Lang | null;
    if (saved === 'en' || saved === 'ko') setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('admin_lang', l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, langLabel: lang === 'en' ? 'English' : 'Korean' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
